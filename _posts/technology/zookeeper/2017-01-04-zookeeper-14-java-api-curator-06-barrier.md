---
layout:			post
title:			Zookeeper之(十四) - zookeeper java API - curator - 06 - barrier
date:			2017-01-17 16:48:00 +0800
categories:		技术文档
tag:			zookeeper
---

* content
{:toc}


Barrier(分布式栅栏)
=====================

Distributed systems use barriers to block processing of a set of nodes until a condition is met at which time all the nodes are allowed to proceed.

分布式栅栏 - 等待一定时间，然后将所有数据一起触发

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
import org.apache.curator.framework.recipes.barriers.DistributedBarrier;
import org.apache.curator.retry.ExponentialBackoffRetry;

/**
 * 
 * Zookeeper - Curator - Barriers - Barrier
 * 
 * 分布式栅栏或 - 等待一定时间，然后将所有数据一起触发
 * 
 * @author Freud
 *
 */
public class CuratorBarriersBarrierZookeeper {

	private static final int SECOND = 1000;
	private static final int thread = 5;
	private static final String path = "/curator_barrier/distribute_barrier";
	private final static CountDownLatch down = new CountDownLatch(1);
	private static DistributedBarrier barrier;

	public static void main(String[] args) throws Exception {
		ExecutorService service = Executors.newFixedThreadPool(thread);
		for (int i = 0; i < thread; i++) {
			final int index = i;
			service.submit(new Runnable() {
				public void run() {
					try {
						new CuratorBarriersBarrierZookeeper().schedule(index);
					} catch (Exception e) {
						e.printStackTrace();
					}
				}
			});
		}
		down.countDown();

		Thread.sleep(2 * SECOND);
		barrier.removeBarrier();

		Thread.sleep(1 * SECOND);
		service.shutdownNow();
	}

	private void schedule(final int index) throws Exception {
		down.await();
		CuratorFramework client = this.getStartedClient(index);
		barrier = new DistributedBarrier(client, path);
		System.out.println("Thread [" + index + "] on ready!");
		barrier.setBarrier();
		barrier.waitOnBarrier();
		System.out.println("Thread [" + index + "] finised!");
	}

	private CuratorFramework getStartedClient(final int index) {
		RetryPolicy rp = new ExponentialBackoffRetry(1 * SECOND, 3);
		// Fluent风格创建
		CuratorFramework cfFluent = CuratorFrameworkFactory.builder().connectString("localhost:2181")
				.sessionTimeoutMs(5 * SECOND).connectionTimeoutMs(3 * SECOND).retryPolicy(rp).build();
		cfFluent.start();
		// System.out.println("Thread [" + index + "] Server connected...");
		return cfFluent;
	}
}
{% endhighlight %}

打印结果
---------------------

{% highlight text %}
Thread [2] on ready!
Thread [0] on ready!
Thread [3] on ready!
Thread [4] on ready!
Thread [1] on ready!
Thread [4] finised!
Thread [3] finised!
Thread [0] finised!
Thread [2] finised!
Thread [1] finised!
{% endhighlight %}


Double Barrier
=====================

Double barriers enable clients to synchronize the beginning and the end of a computation. When enough processes have joined the barrier, processes start their computation and leave the barrier once they have finished.

双栅栏允许客户端在计算的开始和结束时同步。当足够的进程加入到双栅栏时，进程开始计算， 当计算完成时，离开栅栏。 

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
import org.apache.curator.framework.recipes.barriers.DistributedDoubleBarrier;
import org.apache.curator.retry.ExponentialBackoffRetry;

/**
 * 
 * Zookeeper - Curator - Barriers - Barrier
 * 
 * 分布式栅栏 - 等待一定时间，然后将所有数据一起触发
 * 
 * @author Freud
 *
 */
public class CuratorBarriersDoubleBarrierZookeeper {

	private static final int SECOND = 1000;
	private static final int thread = 5;
	private static final String path = "/curator_barrier/double_barrier";
	private final static CountDownLatch down = new CountDownLatch(1);

	public static void main(String[] args) throws Exception {
		ExecutorService service = Executors.newFixedThreadPool(thread);
		for (int i = 0; i < thread; i++) {
			final int index = i;
			service.submit(new Runnable() {
				public void run() {
					try {
						new CuratorBarriersDoubleBarrierZookeeper().schedule(index);
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
		DistributedDoubleBarrier barrier = new DistributedDoubleBarrier(
				new CuratorBarriersDoubleBarrierZookeeper().getStartedClient(), path, thread);
		System.out.println("Thread [" + index + "] on ready!");
		barrier.enter();
		System.out.println("Thread [" + index + "] Running!");
		barrier.leave();
		System.out.println("Thread [" + index + "] finised!");
	}

	private CuratorFramework getStartedClient() {
		RetryPolicy rp = new ExponentialBackoffRetry(1 * SECOND, 3);
		// Fluent风格创建
		CuratorFramework cfFluent = CuratorFrameworkFactory.builder().connectString("localhost:2181")
				.sessionTimeoutMs(5 * SECOND).connectionTimeoutMs(3 * SECOND).retryPolicy(rp).build();
		cfFluent.start();
		// System.out.println("Server connected...");
		return cfFluent;
	}
}
{% endhighlight %}

打印结果
---------------------

{% highlight text %}
Thread [4] on ready!
Thread [1] on ready!
Thread [0] on ready!
Thread [2] on ready!
Thread [3] on ready!
Thread [3] Running!
Thread [0] Running!
Thread [4] Running!
Thread [1] Running!
Thread [2] Running!
Thread [2] finised!
Thread [4] finised!
Thread [0] finised!
Thread [3] finised!
Thread [1] finised!
{% endhighlight %}


参考资料
=====================

Curator官网 : [http://curator.apache.org/](http://curator.apache.org/)

跟着实例学习ZooKeeper的用法： Barrier [http://ifeve.com/zookeeper-barrier/](http://ifeve.com/zookeeper-barrier/)

《从PAXOS到ZOOKEEPER分布式一致性原理与实践》 - 倪超
