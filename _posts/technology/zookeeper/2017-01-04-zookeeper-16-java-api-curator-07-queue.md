---
layout:			post
title:			Zookeeper学习笔记之(十五) - zookeeper java API - curator - 07 - 队列
date:			2017-01-18 09:37:00 +0800
categories:		技术文档
tag:			zookeeper
---

* content
{:toc}

> Curator官方强烈不建议把Zookeeper当作MQ使用。IMPORTANT - We recommend that you do NOT use ZooKeeper for Queues. Please see [Tech Note 4](https://cwiki.apache.org/confluence/display/CURATOR/TN4) for details.

Distributed Queue(分布式队列)
=====================

An implementation of the Distributed Queue ZK recipe. Items put into the queue are guaranteed to be ordered (by means of ZK's PERSISTENTSEQUENTIAL node). If a single consumer takes items out of the queue, they will be ordered FIFO. If ordering is important, use a LeaderSelector to nominate a single consumer.

示例代码
---------------------

{% highlight java %}
package com.freud.zk.curator;

import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.apache.curator.RetryPolicy;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.recipes.queue.DistributedQueue;
import org.apache.curator.framework.recipes.queue.QueueBuilder;
import org.apache.curator.framework.recipes.queue.QueueConsumer;
import org.apache.curator.framework.recipes.queue.QueueSerializer;
import org.apache.curator.framework.state.ConnectionState;
import org.apache.curator.retry.ExponentialBackoffRetry;

/**
 * 
 * Zookeeper - Curator - Queue - Distributed Queue
 * 
 * @author Freud
 *
 */
public class CuratorQueueDistributedQueueZookeeper {

	private static final int SECOND = 1000;
	private static final String path = "/curator_queue/distributed_queue";
	private static final CountDownLatch down = new CountDownLatch(1);

	public static void main(String[] args) throws Exception {

		ExecutorService service = Executors.newFixedThreadPool(10);
		for (int i = 0; i < 5; i++) {
			final int index = i;
			service.submit(new Callable<Void>() {
				public Void call() throws Exception {
					new CuratorQueueDistributedQueueZookeeper().schedule(index);
					return null;
				}
			});
		}
		down.countDown();

		Thread.sleep(10 * SECOND);
		service.shutdown();
	}

	private void schedule(final int index) throws Exception {
		down.await();
		CuratorFramework client = this.getStartedClient(index);
		// 创建队列
		DistributedQueue<String> queue = QueueBuilder.builder(client, new StringQueueConsumer(index),
				new StringQueueSerializer(), path).buildQueue();
		queue.start();
		if (index == 4) {
			Thread.sleep(3 * SECOND);
			for (int i = 0; i < 20; i++) {
				// 生产消息
				queue.put("message " + i);
			}
		}
	}

	private CuratorFramework getStartedClient(int index) {
		RetryPolicy rp = new ExponentialBackoffRetry(1 * SECOND, 3);
		// Fluent风格创建
		CuratorFramework cfFluent = CuratorFrameworkFactory.builder().connectString("localhost:2181")
				.sessionTimeoutMs(5 * SECOND).connectionTimeoutMs(3 * SECOND).retryPolicy(rp).build();
		cfFluent.start();
		System.out.println("Thread [" + index + "] Server connected...");
		return cfFluent;
	}

	/**
	 * 消息消费者
	 * 
	 * @author Freud
	 *
	 */
	public class StringQueueConsumer implements QueueConsumer<String> {

		private int index;

		public StringQueueConsumer(int index) {
			super();
			this.index = index;
		}

		public void stateChanged(CuratorFramework cf, ConnectionState state) {
		}

		public void consumeMessage(String message) throws Exception {
			System.out.println("Thread [" + index + "] get the queue value : " + message);
		}
	}

	/**
	 * 消息序列化和反序列化逻辑
	 * 
	 * @author Freud
	 *
	 */
	public class StringQueueSerializer implements QueueSerializer<String> {

		public byte[] serialize(String item) {
			return item.getBytes();
		}

		public String deserialize(byte[] bytes) {
			return new String(bytes);
		}
	}
}
{% endhighlight %}

打印结果
---------------------

{% highlight text %}
Thread [0] Server connected...
Thread [3] Server connected...
Thread [2] Server connected...
Thread [1] Server connected...
Thread [4] Server connected...
Thread [0] get the queue value : message 0
Thread [1] get the queue value : message 1
Thread [1] get the queue value : message 2
Thread [1] get the queue value : message 3
Thread [1] get the queue value : message 4
Thread [4] get the queue value : message 5
Thread [4] get the queue value : message 6
Thread [4] get the queue value : message 7
Thread [3] get the queue value : message 8
Thread [3] get the queue value : message 9
Thread [3] get the queue value : message 10
Thread [3] get the queue value : message 11
Thread [4] get the queue value : message 12
Thread [2] get the queue value : message 13
Thread [2] get the queue value : message 14
Thread [2] get the queue value : message 15
Thread [4] get the queue value : message 16
Thread [2] get the queue value : message 17
Thread [2] get the queue value : message 18
Thread [2] get the queue value : message 19
{% endhighlight %}


Distributed Id Queue
=====================

A version of DistributedQueue that allows IDs to be associated with queue items. Items can then be removed from the queue if needed.

示例代码
---------------------

{% highlight java %}
package com.freud.zk.curator;

import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.apache.curator.RetryPolicy;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.recipes.queue.DistributedIdQueue;
import org.apache.curator.framework.recipes.queue.QueueBuilder;
import org.apache.curator.framework.recipes.queue.QueueConsumer;
import org.apache.curator.framework.recipes.queue.QueueSerializer;
import org.apache.curator.framework.state.ConnectionState;
import org.apache.curator.retry.ExponentialBackoffRetry;

/**
 * 
 * Zookeeper - Curator - Queue - Distributed Id Queue
 * 
 * @author Freud
 *
 */
public class CuratorQueueDistributedIdQueueZookeeper {

	private static final int SECOND = 1000;
	private static final String path = "/curator_queue/distributed_id_queue";
	private static final CountDownLatch down = new CountDownLatch(1);

	public static void main(String[] args) throws Exception {

		ExecutorService service = Executors.newFixedThreadPool(10);
		for (int i = 0; i < 5; i++) {
			final int index = i;
			service.submit(new Callable<Void>() {
				public Void call() throws Exception {
					new CuratorQueueDistributedIdQueueZookeeper().schedule(index);
					return null;
				}
			});
		}
		down.countDown();

		Thread.sleep(10 * SECOND);
		service.shutdown();
	}

	private void schedule(final int index) throws Exception {
		down.await();
		CuratorFramework client = this.getStartedClient(index);
		// 创建队列
		DistributedIdQueue<String> queue = QueueBuilder.builder(client, new StringQueueConsumer(index),
				new StringQueueSerializer(), path).buildIdQueue();
		queue.start();
		if (index == 4) {
			Thread.sleep(3 * SECOND);
			for (int i = 0; i < 20; i++) {
				// 生产消息
				queue.put("message " + i, i + "");
			}
			// ID Queue的特性是可以通过ID删除消息。
			queue.remove("10");
		}
	}

	private CuratorFramework getStartedClient(int index) {
		RetryPolicy rp = new ExponentialBackoffRetry(1 * SECOND, 3);
		// Fluent风格创建
		CuratorFramework cfFluent = CuratorFrameworkFactory.builder().connectString("localhost:2181")
				.sessionTimeoutMs(5 * SECOND).connectionTimeoutMs(3 * SECOND).retryPolicy(rp).build();
		cfFluent.start();
		System.out.println("Thread [" + index + "] Server connected...");
		return cfFluent;
	}

	/**
	 * 消息消费者
	 * 
	 * @author Freud
	 *
	 */
	public class StringQueueConsumer implements QueueConsumer<String> {

		private int index;

		public StringQueueConsumer(int index) {
			super();
			this.index = index;
		}

		public void stateChanged(CuratorFramework cf, ConnectionState state) {
		}

		public void consumeMessage(String message) throws Exception {
			System.out.println("Thread [" + index + "] get the queue value : " + message);
		}
	}

	/**
	 * 消息序列化和反序列化逻辑
	 * 
	 * @author Freud
	 *
	 */
	public class StringQueueSerializer implements QueueSerializer<String> {

		public byte[] serialize(String item) {
			return item.getBytes();
		}

		public String deserialize(byte[] bytes) {
			return new String(bytes);
		}
	}
}
{% endhighlight %}

打印结果
---------------------

{% highlight text %}
Thread [2] Server connected...
Thread [3] Server connected...
Thread [1] Server connected...
Thread [4] Server connected...
Thread [0] Server connected...
Thread [1] get the queue value : message 0
Thread [3] get the queue value : message 1
Thread [3] get the queue value : message 2
Thread [3] get the queue value : message 3
Thread [3] get the queue value : message 4
Thread [3] get the queue value : message 5
Thread [3] get the queue value : message 6
Thread [3] get the queue value : message 7
Thread [3] get the queue value : message 8
Thread [3] get the queue value : message 9
Thread [4] get the queue value : message 11
Thread [4] get the queue value : message 12
Thread [0] get the queue value : message 13
Thread [0] get the queue value : message 14
Thread [0] get the queue value : message 15
Thread [1] get the queue value : message 16
Thread [1] get the queue value : message 17
Thread [1] get the queue value : message 18
Thread [1] get the queue value : message 19
{% endhighlight %}


Distributed Priority Queue
=====================

An implementation of the Distributed Priority Queue ZK recipe.

示例代码
---------------------

{% highlight java %}
package com.freud.zk.curator;

import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.apache.curator.RetryPolicy;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.recipes.queue.DistributedPriorityQueue;
import org.apache.curator.framework.recipes.queue.QueueBuilder;
import org.apache.curator.framework.recipes.queue.QueueConsumer;
import org.apache.curator.framework.recipes.queue.QueueSerializer;
import org.apache.curator.framework.state.ConnectionState;
import org.apache.curator.retry.ExponentialBackoffRetry;

/**
 * 
 * Zookeeper - Curator - Queue - Distributed Priority Queue
 * 
 * @author Freud
 *
 */
public class CuratorQueueDistributedPriorityQueueZookeeper {

	private static final int SECOND = 1000;
	private static final String path = "/curator_queue/distributed_priority_queue";
	private static final CountDownLatch down = new CountDownLatch(1);

	public static void main(String[] args) throws Exception {

		ExecutorService service = Executors.newFixedThreadPool(10);
		for (int i = 0; i < 5; i++) {
			final int index = i;
			service.submit(new Callable<Void>() {
				public Void call() throws Exception {
					new CuratorQueueDistributedPriorityQueueZookeeper().schedule(index);
					return null;
				}
			});
		}
		down.countDown();

		Thread.sleep(10 * SECOND);
		service.shutdown();
	}

	private void schedule(final int index) throws Exception {
		down.await();
		CuratorFramework client = this.getStartedClient(index);
		// 创建队列
		DistributedPriorityQueue<String> queue = QueueBuilder.builder(client, new StringQueueConsumer(index),
				new StringQueueSerializer(), path).buildPriorityQueue(3);
		queue.start();
		if (index == 4) {
			Thread.sleep(3 * SECOND);
			for (int i = 0; i < 20; i++) {
				// 生产消息
				queue.put("message " + i, 20 - i);
			}
		}
	}

	private CuratorFramework getStartedClient(int index) {
		RetryPolicy rp = new ExponentialBackoffRetry(1 * SECOND, 3);
		// Fluent风格创建
		CuratorFramework cfFluent = CuratorFrameworkFactory.builder().connectString("localhost:2181")
				.sessionTimeoutMs(5 * SECOND).connectionTimeoutMs(3 * SECOND).retryPolicy(rp).build();
		cfFluent.start();
		System.out.println("Thread [" + index + "] Server connected...");
		return cfFluent;
	}

	/**
	 * 消息消费者
	 * 
	 * @author Freud
	 *
	 */
	public class StringQueueConsumer implements QueueConsumer<String> {

		private int index;

		public StringQueueConsumer(int index) {
			super();
			this.index = index;
		}

		public void stateChanged(CuratorFramework cf, ConnectionState state) {
		}

		public void consumeMessage(String message) throws Exception {
			System.out.println("Thread [" + index + "] get the queue value : " + message);
		}
	}

	/**
	 * 消息序列化和反序列化逻辑
	 * 
	 * @author Freud
	 *
	 */
	public class StringQueueSerializer implements QueueSerializer<String> {

		public byte[] serialize(String item) {
			return item.getBytes();
		}

		public String deserialize(byte[] bytes) {
			return new String(bytes);
		}
	}
}
{% endhighlight %}

打印结果
---------------------

{% highlight text %}
Thread [0] Server connected...
Thread [2] Server connected...
Thread [4] Server connected...
Thread [3] Server connected...
Thread [1] Server connected...
Thread [3] get the queue value : message 19
Thread [0] get the queue value : message 18
Thread [0] get the queue value : message 17
Thread [0] get the queue value : message 16
Thread [0] get the queue value : message 15
Thread [0] get the queue value : message 14
Thread [0] get the queue value : message 13
Thread [3] get the queue value : message 12
Thread [3] get the queue value : message 11
Thread [3] get the queue value : message 10
Thread [3] get the queue value : message 9
Thread [0] get the queue value : message 8
Thread [1] get the queue value : message 7
Thread [1] get the queue value : message 6
Thread [0] get the queue value : message 5
Thread [0] get the queue value : message 4
Thread [0] get the queue value : message 3
Thread [0] get the queue value : message 2
Thread [0] get the queue value : message 1
Thread [0] get the queue value : message 0
{% endhighlight %}


Distributed Delay Queue
=====================

An implementation of a Distributed Delay Queue.

示例代码
---------------------

{% highlight java %}
package com.freud.zk.curator;

import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.apache.curator.RetryPolicy;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.recipes.queue.DistributedDelayQueue;
import org.apache.curator.framework.recipes.queue.QueueBuilder;
import org.apache.curator.framework.recipes.queue.QueueConsumer;
import org.apache.curator.framework.recipes.queue.QueueSerializer;
import org.apache.curator.framework.state.ConnectionState;
import org.apache.curator.retry.ExponentialBackoffRetry;

/**
 * 
 * Zookeeper - Curator - Queue - Distributed Delay Queue
 * 
 * @author Freud
 *
 */
public class CuratorQueueDistributedDelayQueueZookeeper {

	private static final int SECOND = 1000;
	private static final String path = "/curator_queue/distributed_delay_queue";
	private static final CountDownLatch down = new CountDownLatch(1);

	public static void main(String[] args) throws Exception {

		CuratorFramework client = new CuratorQueueDistributedDelayQueueZookeeper().getStartedClient(-1);
		if (client.checkExists().forPath(path) != null) {
			client.delete().deletingChildrenIfNeeded().forPath(path);
		}
		client.close();
		ExecutorService service = Executors.newFixedThreadPool(10);
		for (int i = 0; i < 5; i++) {
			final int index = i;
			service.submit(new Callable<Void>() {
				public Void call() throws Exception {
					new CuratorQueueDistributedDelayQueueZookeeper().schedule(index);
					return null;
				}
			});
		}
		down.countDown();

		Thread.sleep(20 * SECOND);
		service.shutdown();
	}

	private void schedule(final int index) throws Exception {
		down.await();
		CuratorFramework client = this.getStartedClient(index);
		// 创建队列
		DistributedDelayQueue<String> queue = QueueBuilder.builder(client, new StringQueueConsumer(index),
				new StringQueueSerializer(), path).buildDelayQueue();
		queue.start();
		if (index == 4) {
			Thread.sleep(3 * SECOND);
			for (int i = 0; i < 20; i++) {
				// 生产消息 ,其中DelayUtilEpoch的单位为毫秒,代表触发时间的毫秒数，集群环境下需要注意做时间同步
				queue.put("message " + i, System.currentTimeMillis() + ((i + 1) * SECOND / 2));
			}
		}
	}

	private CuratorFramework getStartedClient(int index) {
		RetryPolicy rp = new ExponentialBackoffRetry(1 * SECOND, 3);
		// Fluent风格创建
		CuratorFramework cfFluent = CuratorFrameworkFactory.builder().connectString("localhost:2181")
				.sessionTimeoutMs(5 * SECOND).connectionTimeoutMs(3 * SECOND).retryPolicy(rp).build();
		cfFluent.start();
		System.out.println("Thread [" + index + "] Server connected...");
		return cfFluent;
	}

	/**
	 * 消息消费者
	 * 
	 * @author Freud
	 *
	 */
	public class StringQueueConsumer implements QueueConsumer<String> {

		private int index;

		public StringQueueConsumer(int index) {
			super();
			this.index = index;
		}

		public void stateChanged(CuratorFramework cf, ConnectionState state) {
		}

		public void consumeMessage(String message) throws Exception {
			System.out.println("Thread [" + index + "] get the queue value : " + message);
		}
	}

	/**
	 * 消息序列化和反序列化逻辑
	 * 
	 * @author Freud
	 *
	 */
	public class StringQueueSerializer implements QueueSerializer<String> {

		public byte[] serialize(String item) {
			return item.getBytes();
		}

		public String deserialize(byte[] bytes) {
			return new String(bytes);
		}
	}
}
{% endhighlight %}

打印结果
---------------------

{% highlight text %}
Thread [-1] Server connected...
Thread [4] Server connected...
Thread [3] Server connected...
Thread [0] Server connected...
Thread [2] Server connected...
Thread [1] Server connected...
Thread [1] get the queue value : message 0
Thread [1] get the queue value : message 1
Thread [2] get the queue value : message 2
Thread [2] get the queue value : message 3
Thread [0] get the queue value : message 4
Thread [1] get the queue value : message 5
Thread [4] get the queue value : message 6
Thread [1] get the queue value : message 7
Thread [2] get the queue value : message 8
Thread [0] get the queue value : message 9
Thread [2] get the queue value : message 10
Thread [1] get the queue value : message 11
Thread [1] get the queue value : message 12
Thread [1] get the queue value : message 13
Thread [0] get the queue value : message 14
Thread [0] get the queue value : message 15
Thread [4] get the queue value : message 16
Thread [0] get the queue value : message 17
Thread [2] get the queue value : message 18
Thread [1] get the queue value : message 19
{% endhighlight %}

> 可以观察到消息打印按照500毫秒的间隔依次有序打印出来。


Simple Distributed Queue
=====================

A drop-in replacement for the DistributedQueue that comes with the ZK distribution.

示例代码
---------------------

{% highlight java %}
package com.freud.zk.curator;

import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.apache.curator.RetryPolicy;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.recipes.queue.SimpleDistributedQueue;
import org.apache.curator.retry.ExponentialBackoffRetry;

/**
 * 
 * Zookeeper - Curator - Queue - Simple Distributed Queue
 * 
 * @author Freud
 *
 */
public class CuratorQueueSimpleDistributedQueueZookeeper {

	private static final int SECOND = 1000;
	private static final String path = "/curator_queue/simple_distributed_queue";
	private static final CountDownLatch down = new CountDownLatch(1);

	public static void main(String[] args) throws Exception {

		CuratorFramework client = new CuratorQueueSimpleDistributedQueueZookeeper().getStartedClient(-1);
		if (client.checkExists().forPath(path) != null) {
			client.delete().deletingChildrenIfNeeded().forPath(path);
		}
		client.close();
		ExecutorService service = Executors.newFixedThreadPool(10);
		for (int i = 0; i < 5; i++) {
			final int index = i;
			service.submit(new Callable<Void>() {
				public Void call() throws Exception {
					new CuratorQueueSimpleDistributedQueueZookeeper().schedule(index);
					return null;
				}
			});
		}
		down.countDown();

		Thread.sleep(20 * SECOND);
		service.shutdown();
	}

	private void schedule(final int index) throws Exception {
		down.await();
		CuratorFramework client = this.getStartedClient(index);
		SimpleDistributedQueue queue = new SimpleDistributedQueue(client, path);
		if (index == 4) {
			Thread.sleep(3 * SECOND);
			for (int i = 0; i < 20; i++) {
				// 生产消息
				queue.offer(("message " + i).getBytes());
			}
		} else {
			while (true) {
				System.out.println("Thread [" + index + "] get queue value :" + new String(queue.take()));
			}
		}
	}

	private CuratorFramework getStartedClient(int index) {
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
Thread [-1] Server connected...
Thread [0] Server connected...
Thread [1] Server connected...
Thread [4] Server connected...
Thread [2] Server connected...
Thread [3] Server connected...
Thread [0] get queue value :message 0
Thread [0] get queue value :message 1
Thread [1] get queue value :message 2
Thread [0] get queue value :message 3
Thread [1] get queue value :message 4
Thread [0] get queue value :message 5
Thread [1] get queue value :message 6
Thread [0] get queue value :message 7
Thread [3] get queue value :message 8
Thread [1] get queue value :message 9
Thread [0] get queue value :message 10
Thread [0] get queue value :message 11
Thread [1] get queue value :message 12
Thread [2] get queue value :message 13
Thread [1] get queue value :message 14
Thread [3] get queue value :message 15
Thread [0] get queue value :message 16
Thread [1] get queue value :message 17
Thread [0] get queue value :message 18
Thread [3] get queue value :message 19
{% endhighlight %}


参考资料
=====================

《从PAXOS到ZOOKEEPER分布式一致性原理与实践》 - 倪超

Curator官网 : [http://curator.apache.org/](http://curator.apache.org/)
