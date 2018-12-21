---
layout:			post
title:			Zookeeper之(十三) - zookeeper java API - curator - 05 - 分布式计数器
date:			2017-01-17 15:57:00 +0800
categories:		技术文档
tag:			zookeeper
---

* content
{:toc}


Shared Counter(共享计数器)
=====================

Manages a shared integer. All clients watching the same path will have the up-to-date value of the shared integer (considering ZK's normal consistency guarantees).

> 共享计数器，适用于Master操作，并将计数结果同步到其他所有的从服务器的情景，Zk Watcher的一个基础应用

示例代码
---------------------

{% highlight java %}
package com.freud.zk.curator;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.apache.curator.RetryPolicy;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.recipes.shared.SharedCount;
import org.apache.curator.framework.recipes.shared.SharedCountListener;
import org.apache.curator.framework.recipes.shared.SharedCountReader;
import org.apache.curator.framework.state.ConnectionState;
import org.apache.curator.retry.ExponentialBackoffRetry;

/**
 * 
 * Zookeeper - Curator - Counter - SharedCounter
 * 
 * 共享计数器，适用于Master操作，并将计数结果同步到其他所有的从服务器的情景
 * 
 * @author Freud
 *
 */
public class CuratorCounterSharedCounterZookeeper {

	private static final int SECOND = 1000;

	public static void main(String[] args) throws Exception {
		ExecutorService service = Executors.newFixedThreadPool(3);
		for (int i = 0; i < 3; i++) {
			final int index = i;
			service.submit(new Runnable() {
				public void run() {
					try {
						new CuratorCounterSharedCounterZookeeper().schedule(index);
					} catch (Exception e) {
						e.printStackTrace();
					}
				}
			});
		}

		Thread.sleep(10 * SECOND);
		service.shutdownNow();
	}

	private void schedule(final int index) throws Exception {

		CuratorFramework client = this.getStartedClient(index);
		String path = "/curator_counter/shared_counter";

		final SharedCount count = new SharedCount(client, path, 100);
		count.addListener(new SharedCountListener() {

			public void stateChanged(CuratorFramework client, ConnectionState state) {
				System.out.println("Thread [" + index + "][Callback]State changed!");
			}

			public void countHasChanged(SharedCountReader reader, int value) throws Exception {
				System.out.println("Thread [" + index + "][Callback]Count changed to [" + value + "]!");
			}
		});

		new Thread(new Runnable() {

			public void run() {
				try {
					Thread.sleep((index + 1) * 1000);
					count.setCount(index);
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		}).start();

		count.start();
	}

	private CuratorFramework getStartedClient(final int index) {
		RetryPolicy rp = new ExponentialBackoffRetry(1 * SECOND, 3);
		// Fluent风格创建
		CuratorFramework cfFluent = CuratorFrameworkFactory.builder().connectString("localhost:2181")
				.sessionTimeoutMs(5 * SECOND).connectionTimeoutMs(3 * SECOND).retryPolicy(rp).build();
		cfFluent.start();
		System.out.println("Thread [" + index + "] Server connected...");
		return cfFluent;
	}
}
{% endhighlight %}

打印结果
---------------------

{% highlight text %}
Thread [2] Server connected...
Thread [1] Server connected...
Thread [0] Server connected...
Thread [0][Callback]State changed!
Thread [2][Callback]State changed!
Thread [1][Callback]State changed!
Thread [2][Callback]Count changed to [0]!
Thread [1][Callback]Count changed to [0]!
Thread [0][Callback]Count changed to [0]!
Thread [2][Callback]Count changed to [1]!
Thread [1][Callback]Count changed to [1]!
Thread [0][Callback]Count changed to [1]!
Thread [0][Callback]Count changed to [2]!
Thread [2][Callback]Count changed to [2]!
Thread [1][Callback]Count changed to [2]!
{% endhighlight %}


Distributed Atomic Long(分布式计数器)
=====================

A counter that attempts atomic increments. It first tries using optimistic locking. If that fails, an optional InterProcessMutex is taken. For both optimistic and mutex, a retry policy is used to retry the increment.

示例代码
---------------------

{% highlight java %}
package com.freud.zk.curator;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.apache.curator.RetryPolicy;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.recipes.atomic.AtomicValue;
import org.apache.curator.framework.recipes.atomic.DistributedAtomicLong;
import org.apache.curator.retry.ExponentialBackoffRetry;

/**
 * 
 * Zookeeper - Curator - Counter - DistributedAtomicLong
 * 
 * 分布式计数器
 * 
 * @author Freud
 *
 */
public class CuratorCounterDistributedAtomicLongZookeeper {

	private static final int SECOND = 1000;

	private final static CountDownLatch down = new CountDownLatch(1);

	public static void main(String[] args) throws Exception {
		ExecutorService service = Executors.newFixedThreadPool(3);
		for (int i = 0; i < 3; i++) {
			final int index = i;
			service.submit(new Runnable() {
				public void run() {
					try {
						new CuratorCounterDistributedAtomicLongZookeeper().schedule(index);
					} catch (Exception e) {
						e.printStackTrace();
					}
				}
			});
		}
		down.countDown();
		Thread.sleep(10 * SECOND);
		service.shutdownNow();
	}

	private void schedule(final int index) throws Exception {
		down.await();
		CuratorFramework client = this.getStartedClient(index);
		String path = "/curator_counter/distribute_atomic_long";
		DistributedAtomicLong count = new DistributedAtomicLong(client, path, new ExponentialBackoffRetry(1000, 3));
		Thread.sleep((index + 1) * SECOND);
		AtomicValue<Long> al = count.get();
		System.out.println("Thread [" + index + "] get new Long value [" + al.postValue() + "] result status ["
				+ al.succeeded() + "]");
		count.increment();
	}

	private CuratorFramework getStartedClient(final int index) {
		RetryPolicy rp = new ExponentialBackoffRetry(1 * SECOND, 3);
		// Fluent风格创建
		CuratorFramework cfFluent = CuratorFrameworkFactory.builder().connectString("localhost:2181")
				.sessionTimeoutMs(5 * SECOND).connectionTimeoutMs(3 * SECOND).retryPolicy(rp).build();
		cfFluent.start();
		System.out.println("Thread [" + index + "] Server connected...");
		return cfFluent;
	}
}
{% endhighlight %}

打印结果
---------------------

{% highlight text %}
Thread [0] Server connected...
Thread [1] Server connected...
Thread [2] Server connected...
Thread [0] get new Long value [0] result status [true]
Thread [1] get new Long value [1] result status [true]
Thread [2] get new Long value [2] result status [true]
{% endhighlight %}


参考资料
=====================

《从PAXOS到ZOOKEEPER分布式一致性原理与实践》 - 倪超

Curator官网 : [http://curator.apache.org/](http://curator.apache.org/)
