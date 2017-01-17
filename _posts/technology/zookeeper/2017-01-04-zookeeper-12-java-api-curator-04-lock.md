---
layout:			post
title:			Zookeeper学习笔记之(十二) - zookeeper java API - curator - 04 - 分布式锁
date:			2017-01-17 13:14:00 +0800
categories:		技术文档
tag:			zookeeper
---

* content
{:toc}


Shared Reentrant Lock(分布式可重入锁)
==========================

Fully distributed locks that are globally synchronous, meaning at any snapshot in time no two clients think they hold the same lock.

示例代码
-----------------

{% highlight java %}
package com.freud.zk.curator;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.concurrent.CountDownLatch;

import org.apache.curator.RetryPolicy;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.recipes.locks.InterProcessMutex;
import org.apache.curator.retry.ExponentialBackoffRetry;

/**
 * 
 * Zookeeper - Curator - Lock - SharedReentrantLock
 * 
 * @author Freud
 *
 */
public class CuratorLockSharedReentrantLockZookeeper {

	private static final int SECOND = 1000;

	public static void main(String[] args) throws Exception {

		final CuratorLockSharedReentrantLockZookeeper instance = new CuratorLockSharedReentrantLockZookeeper();
		CuratorFramework client = instance.getStartedClient();
		String path = "/curator_lock/shared_reentrant_lock";
		final InterProcessMutex lock = new InterProcessMutex(client, path);
		final CountDownLatch down = new CountDownLatch(1);
		for (int i = 0; i < 30; i++) {
			new Thread(new Runnable() {
				public void run() {
					try {
						down.await();
						// 重入锁 - 获取两次
						lock.acquire();
						lock.acquire();
						SimpleDateFormat sdf = new SimpleDateFormat("HH:mm:ss|SSS");
						String orderNo = sdf.format(new Date());
						System.out.println("生成的订单号是:" + orderNo);
					} catch (Exception e) {
						e.printStackTrace();
					} finally {
						try {
							// 获取两次需要释放两次
							lock.release();
							lock.release();
						} catch (Exception e) {
							e.printStackTrace();
						}
					}
				}
			}).start();
		}
		// 保证所有线程内部逻辑执行时间一致
		down.countDown();
		Thread.sleep(10 * SECOND);
		if (client != null) {
			client.close();
		}
		System.out.println("Server closed...");
	}

	private CuratorFramework getStartedClient() {
		RetryPolicy rp = new ExponentialBackoffRetry(1 * SECOND, 3);
		// Fluent风格创建
		CuratorFramework cfFluent = CuratorFrameworkFactory.builder().connectString("localhost:2181")
				.sessionTimeoutMs(5 * SECOND).connectionTimeoutMs(3 * SECOND).retryPolicy(rp).build();
		cfFluent.start();
		System.out.println("Server connected...");
		return cfFluent;
	}
}
{% endhighlight %}

打印结果
-----------------

{% highlight text %}
Server connected...
生成的订单号是:11:32:51|713
生成的订单号是:11:32:51|797
生成的订单号是:11:32:51|876
生成的订单号是:11:32:51|977
生成的订单号是:11:32:52|054
生成的订单号是:11:32:52|104
生成的订单号是:11:32:52|179
生成的订单号是:11:32:52|239
生成的订单号是:11:32:52|295
生成的订单号是:11:32:52|396
生成的订单号是:11:32:52|452
生成的订单号是:11:32:52|550
生成的订单号是:11:32:52|634
生成的订单号是:11:32:52|764
生成的订单号是:11:32:52|906
生成的订单号是:11:32:53|032
生成的订单号是:11:32:53|094
生成的订单号是:11:32:53|153
生成的订单号是:11:32:53|204
生成的订单号是:11:32:53|261
生成的订单号是:11:32:53|321
生成的订单号是:11:32:53|382
生成的订单号是:11:32:53|448
生成的订单号是:11:32:53|510
生成的订单号是:11:32:53|566
生成的订单号是:11:32:53|617
生成的订单号是:11:32:53|679
生成的订单号是:11:32:53|735
生成的订单号是:11:32:53|789
生成的订单号是:11:32:53|842
Server closed...
{% endhighlight %}


Shared Lock(分布式锁)
==========================

Similar to Shared Reentrant Lock but not reentrant.

示例代码
-----------------

{% highlight java %}
package com.freud.zk.curator;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.concurrent.CountDownLatch;

import org.apache.curator.RetryPolicy;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.recipes.locks.InterProcessSemaphoreMutex;
import org.apache.curator.retry.ExponentialBackoffRetry;

/**
 * 
 * Zookeeper - Curator - Lock - SharedLock
 * 
 * @author Freud
 *
 */
public class CuratorLockSharedLockZookeeper {

	private static final int SECOND = 1000;

	public static void main(String[] args) throws Exception {

		final CuratorLockSharedLockZookeeper instance = new CuratorLockSharedLockZookeeper();
		CuratorFramework client = instance.getStartedClient();
		String path = "/curator_lock/shared_lock";
		final InterProcessSemaphoreMutex lock = new InterProcessSemaphoreMutex(client, path);
		final CountDownLatch down = new CountDownLatch(1);
		for (int i = 0; i < 30; i++) {
			new Thread(new Runnable() {
				public void run() {
					try {
						down.await();
						// 非重入锁 - 只可以获取一次
						lock.acquire();
						SimpleDateFormat sdf = new SimpleDateFormat("HH:mm:ss|SSS");
						String orderNo = sdf.format(new Date());
						System.out.println("生成的订单号是:" + orderNo);
					} catch (Exception e) {
						e.printStackTrace();
					} finally {
						try {
							// 由于获取一次，所以释放一次
							lock.release();
						} catch (Exception e) {
							e.printStackTrace();
						}
					}
				}
			}).start();
		}
		// 保证所有线程内部逻辑执行时间一致
		down.countDown();
		Thread.sleep(10 * SECOND);
		if (client != null) {
			client.close();
		}
		System.out.println("Server closed...");
	}

	private CuratorFramework getStartedClient() {
		RetryPolicy rp = new ExponentialBackoffRetry(1 * SECOND, 3);
		// Fluent风格创建
		CuratorFramework cfFluent = CuratorFrameworkFactory.builder().connectString("localhost:2181")
				.sessionTimeoutMs(5 * SECOND).connectionTimeoutMs(3 * SECOND).retryPolicy(rp).build();
		cfFluent.start();
		System.out.println("Server connected...");
		return cfFluent;
	}
}
{% endhighlight %}

打印结果
-----------------

{% highlight text %}
Server connected...
生成的订单号是:11:33:25|045
生成的订单号是:11:33:25|229
生成的订单号是:11:33:25|417
生成的订单号是:11:33:25|611
生成的订单号是:11:33:25|797
生成的订单号是:11:33:25|978
生成的订单号是:11:33:26|182
生成的订单号是:11:33:26|357
生成的订单号是:11:33:26|773
生成的订单号是:11:33:27|151
生成的订单号是:11:33:27|326
生成的订单号是:11:33:27|517
生成的订单号是:11:33:27|691
生成的订单号是:11:33:27|899
生成的订单号是:11:33:28|080
生成的订单号是:11:33:28|258
生成的订单号是:11:33:28|425
生成的订单号是:11:33:28|591
生成的订单号是:11:33:28|766
生成的订单号是:11:33:29|021
生成的订单号是:11:33:29|188
生成的订单号是:11:33:29|457
生成的订单号是:11:33:29|624
生成的订单号是:11:33:29|798
生成的订单号是:11:33:29|966
生成的订单号是:11:33:30|131
生成的订单号是:11:33:30|339
生成的订单号是:11:33:30|494
生成的订单号是:11:33:30|669
生成的订单号是:11:33:30|831
Server closed...
{% endhighlight %}


Shared Reentrant Read Write Lock(分布式可重入读写锁)
==========================

A re-entrant read/write mutex that works across JVMs. A read write lock maintains a pair of associated locks, one for read-only operations and one for writing. The read lock may be held simultaneously by multiple reader processes, so long as there are no writers. The write lock is exclusive.

+ 读取锁允许多个reader线程同时持有, 而写入锁最多只能有一个writter线程持有.
+ 读写锁的使用场合: 读取共享数据的频率远大于修改共享数据的频率. 在上述场合下, 使用读写锁控制共享资源的访问, 可以提高并发性能.
+ 如果一个线程已经持有了写入锁, 则可以再持有读取锁. 相反, 如果一个线程已经持有了读取锁, 则在释放该读取锁之前, 不能再持有写入锁.

示例代码
-----------------

{% highlight java %}
package com.freud.zk.curator;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.concurrent.CountDownLatch;

import org.apache.curator.RetryPolicy;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.recipes.locks.InterProcessReadWriteLock;
import org.apache.curator.retry.ExponentialBackoffRetry;

/**
 * 
 * Zookeeper - Curator - Lock - SharedReentrantReadWriteLock
 * 
 * @author Freud
 *
 */
public class CuratorLockSharedReentrantReadWriteLockZookeeper {

	private static final int SECOND = 1000;

	public static void main(String[] args) throws Exception {

		final CuratorLockSharedReentrantReadWriteLockZookeeper instance = new CuratorLockSharedReentrantReadWriteLockZookeeper();
		CuratorFramework client = instance.getStartedClient();
		String path = "/curator_lock/shared_reentrant_read_write_lock";
		final InterProcessReadWriteLock lock = new InterProcessReadWriteLock(client, path);
		final CountDownLatch down = new CountDownLatch(1);
		for (int i = 0; i < 30; i++) {
			final int index = i;
			new Thread(new Runnable() {
				public void run() {
					try {
						down.await();
						if (index % 2 == 0) {
							lock.readLock().acquire();
							SimpleDateFormat sdf = new SimpleDateFormat("HH:mm:ss|SSS");
							String orderNo = sdf.format(new Date());
							System.out.println("[READ]生成的订单号是:" + orderNo);
						} else {
							lock.writeLock().acquire();
							SimpleDateFormat sdf = new SimpleDateFormat("HH:mm:ss|SSS");
							String orderNo = sdf.format(new Date());
							System.out.println("[WRITE]生成的订单号是:" + orderNo);
						}

					} catch (Exception e) {
						e.printStackTrace();
					} finally {
						try {
							if (index % 2 == 0) {
								lock.readLock().release();
							} else {
								lock.writeLock().release();
							}
						} catch (Exception e) {
							e.printStackTrace();
						}
					}
				}
			}).start();
		}
		// 保证所有线程内部逻辑执行时间一致
		down.countDown();
		Thread.sleep(10 * SECOND);
		if (client != null) {
			client.close();
		}
		System.out.println("Server closed...");
	}

	private CuratorFramework getStartedClient() {
		RetryPolicy rp = new ExponentialBackoffRetry(1 * SECOND, 3);
		// Fluent风格创建
		CuratorFramework cfFluent = CuratorFrameworkFactory.builder().connectString("localhost:2181")
				.sessionTimeoutMs(5 * SECOND).connectionTimeoutMs(3 * SECOND).retryPolicy(rp).build();
		cfFluent.start();
		System.out.println("Server connected...");
		return cfFluent;
	}
}
{% endhighlight %}

打印结果
-----------------

{% highlight text %}
Server connected...
[WRITE]生成的订单号是:11:25:12|289
[READ]生成的订单号是:11:25:12|417
[READ]生成的订单号是:11:25:12|482
[WRITE]生成的订单号是:11:25:12|543
[READ]生成的订单号是:11:25:12|597
[WRITE]生成的订单号是:11:25:12|661
[READ]生成的订单号是:11:25:12|725
[WRITE]生成的订单号是:11:25:12|808
[READ]生成的订单号是:11:25:12|866
[WRITE]生成的订单号是:11:25:12|932
[WRITE]生成的订单号是:11:25:13|088
[WRITE]生成的订单号是:11:25:13|154
[READ]生成的订单号是:11:25:13|208
[WRITE]生成的订单号是:11:25:13|278
[WRITE]生成的订单号是:11:25:13|327
[READ]生成的订单号是:11:25:13|405
[WRITE]生成的订单号是:11:25:13|456
[READ]生成的订单号是:11:25:13|511
[READ]生成的订单号是:11:25:13|564
[READ]生成的订单号是:11:25:13|628
[WRITE]生成的订单号是:11:25:13|685
[READ]生成的订单号是:11:25:13|744
[READ]生成的订单号是:11:25:13|745
[WRITE]生成的订单号是:11:25:13|913
[READ]生成的订单号是:11:25:13|971
[READ]生成的订单号是:11:25:13|971
[READ]生成的订单号是:11:25:13|971
[WRITE]生成的订单号是:11:25:14|080
[WRITE]生成的订单号是:11:25:14|133
[WRITE]生成的订单号是:11:25:14|178
Server closed...
{% endhighlight %}

> 分析结果得到读`[READ]生成的订单号是:11:25:13|971`有重复，但是读写，和写之间并没有重复数据。符合读写锁的基本要求。

Shared Semaphore(分布式信号量)
==========================

A counting semaphore that works across JVMs. All processes in all JVMs that use the same lock path will achieve an inter-process limited set of leases. Further, this semaphore is mostly "fair" - each user will get a lease in the order requested (from ZK's point of view).

> Semaphore可以控制某个资源可被同时访问的个数，通过`acquire()`获取一个许可，如果没有就等待，而`returnLease(lease)`释放一个许可。举个例子就像窗口排队买票，窗口数是一定的，所以晚来的只能等待窗口空闲出来的时候才能使用。

示例代码
-----------------

{% highlight java %}
package com.freud.zk.curator;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.concurrent.CountDownLatch;

import org.apache.curator.RetryPolicy;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.recipes.locks.InterProcessSemaphoreV2;
import org.apache.curator.framework.recipes.locks.Lease;
import org.apache.curator.retry.ExponentialBackoffRetry;

/**
 * 
 * Zookeeper - Curator - Lock - SharedSemaphoreLock
 * 
 * @author Freud
 *
 */
public class CuratorLockSharedSemaphoreZookeeper {

	private static final int SECOND = 1000;

	public static void main(String[] args) throws Exception {

		final CuratorLockSharedSemaphoreZookeeper instance = new CuratorLockSharedSemaphoreZookeeper();
		CuratorFramework client = instance.getStartedClient();
		String path = "/curator_lock/shared_semaphore_lock";

		final InterProcessSemaphoreV2 lock = new InterProcessSemaphoreV2(client, path, 3);
		final CountDownLatch down = new CountDownLatch(1);
		for (int i = 0; i < 20; i++) {
			new Thread(new Runnable() {
				public void run() {
					Lease lease = null;
					try {
						down.await();
						// 排队等候分配资源
						lease = lock.acquire();
						SimpleDateFormat sdf = new SimpleDateFormat("HH:mm:ss|SSS");
						String orderNo = sdf.format(new Date());
						System.out.println("生成的订单号是:" + orderNo);
						Thread.sleep(1 * SECOND);
					} catch (Exception e) {
						e.printStackTrace();
					} finally {
						try {
							if (lease != null) {
								// 归还正在使用的资源
								lock.returnLease(lease);
							}
						} catch (Exception e) {
							e.printStackTrace();
						}
					}
				}
			}).start();
		}
		// 保证所有线程内部逻辑执行时间一致
		down.countDown();
		Thread.sleep(10 * SECOND);
		if (client != null) {
			client.close();
		}
		System.out.println("Server closed...");
	}

	private CuratorFramework getStartedClient() {
		RetryPolicy rp = new ExponentialBackoffRetry(1 * SECOND, 3);
		// Fluent风格创建
		CuratorFramework cfFluent = CuratorFrameworkFactory.builder().connectString("localhost:2181")
				.sessionTimeoutMs(5 * SECOND).connectionTimeoutMs(3 * SECOND).retryPolicy(rp).build();
		cfFluent.start();
		System.out.println("Server connected...");
		return cfFluent;
	}
}
{% endhighlight %}

打印结果
-----------------

{% highlight text %}
Server connected...
生成的订单号是:13:02:45|559
生成的订单号是:13:02:45|692
生成的订单号是:13:02:45|829
生成的订单号是:13:02:46|681
生成的订单号是:13:02:46|849
生成的订单号是:13:02:47|048
生成的订单号是:13:02:47|798
生成的订单号是:13:02:47|952
生成的订单号是:13:02:48|148
生成的订单号是:13:02:49|048
生成的订单号是:13:02:49|276
生成的订单号是:13:02:49|384
生成的订单号是:13:02:50|153
生成的订单号是:13:02:50|393
生成的订单号是:13:02:50|616
生成的订单号是:13:02:51|265
生成的订单号是:13:02:51|496
生成的订单号是:13:02:51|731
生成的订单号是:13:02:52|393
生成的订单号是:13:02:52|597
Server closed...
{% endhighlight %}

> 结果打印过程中能明显看到每3个一组，中间间隔1秒左右进行打印。

Multi Shared Lock(多共享分布式锁)
==========================

A container that manages multiple locks as a single entity. When acquire() is called, all the locks are acquired. If that fails, any paths that were acquired are released. Similarly, when release() is called, all locks are released (failures are ignored).

> 多个锁作为一个锁，可以同时在多个资源上加锁。

示例代码
-----------------

{% highlight java %}
package com.freud.zk.curator;

import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.concurrent.CountDownLatch;

import org.apache.curator.RetryPolicy;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.recipes.locks.InterProcessMultiLock;
import org.apache.curator.retry.ExponentialBackoffRetry;

/**
 * 
 * Zookeeper - Curator - Lock - MultiSharedLock
 * 
 * @author Freud
 *
 */
public class CuratorLockMultiSharedLockZookeeper {

	private static final int SECOND = 1000;

	public static void main(String[] args) throws Exception {

		final CuratorLockMultiSharedLockZookeeper instance = new CuratorLockMultiSharedLockZookeeper();
		CuratorFramework client = instance.getStartedClient();
		String path1 = "/curator_lock/multi_shared_lock1";
		String path2 = "/curator_lock/multi_shared_lock2";
		String path3 = "/curator_lock/multi_shared_lock3";

		final InterProcessMultiLock lock = new InterProcessMultiLock(client, Arrays.asList(new String[] { path1, path2,
				path3 }));
		final CountDownLatch down = new CountDownLatch(1);
		for (int i = 0; i < 10; i++) {
			new Thread(new Runnable() {
				public void run() {
					try {
						down.await();
						lock.acquire();
						SimpleDateFormat sdf = new SimpleDateFormat("HH:mm:ss|SSS");
						String orderNo = sdf.format(new Date());
						System.out.println("生成的订单号是:" + orderNo);
					} catch (Exception e) {
						e.printStackTrace();
					} finally {
						try {
							lock.release();
						} catch (Exception e) {
							e.printStackTrace();
						}
					}
				}
			}).start();
		}
		// 保证所有线程内部逻辑执行时间一致
		down.countDown();
		Thread.sleep(10 * SECOND);
		if (client != null) {
			client.close();
		}
		System.out.println("Server closed...");
	}

	private CuratorFramework getStartedClient() {
		RetryPolicy rp = new ExponentialBackoffRetry(1 * SECOND, 3);
		// Fluent风格创建
		CuratorFramework cfFluent = CuratorFrameworkFactory.builder().connectString("localhost:2181")
				.sessionTimeoutMs(5 * SECOND).connectionTimeoutMs(3 * SECOND).retryPolicy(rp).build();
		cfFluent.start();
		System.out.println("Server connected...");
		return cfFluent;
	}
}
{% endhighlight %}

打印结果
-----------------

{% highlight text %}
Server connected...
生成的订单号是:13:09:44|845
生成的订单号是:13:09:45|183
生成的订单号是:13:09:45|455
生成的订单号是:13:09:45|792
生成的订单号是:13:09:46|071
生成的订单号是:13:09:46|363
生成的订单号是:13:09:46|637
生成的订单号是:13:09:47|056
生成的订单号是:13:09:47|344
生成的订单号是:13:09:47|601
Server closed...
{% endhighlight %}


参考资料
==========================

Curator官网 : [http://curator.apache.org/](http://curator.apache.org/)

《从PAXOS到ZOOKEEPER分布式一致性原理与实践》 - 倪超

java并发编程--互斥锁, 读写锁及条件 [http://coolxing.iteye.com/blog/1236909](http://coolxing.iteye.com/blog/1236909)

Java 信号量 Semaphore 介绍 [http://www.cnblogs.com/whgw/archive/2011/09/29/2195555.html](http://www.cnblogs.com/whgw/archive/2011/09/29/2195555.html)

synchronized和ReentrantLock的区别 [http://www.cnblogs.com/fanguangdexiaoyuer/p/5313653.html](http://www.cnblogs.com/fanguangdexiaoyuer/p/5313653.html)


> 上文中标题中的`shared`应当翻译为`共享`，但是笔者觉得`共享`不足以表达此处需要表达的分布式意思，所以翻译为了`分布式`。
