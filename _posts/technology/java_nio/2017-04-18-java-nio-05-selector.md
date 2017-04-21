---
layout 		: post
title 		: Java NIO系列学习笔记（五） - Selector
date 		: 2017-04-18 10:56:01 +0800
categories 	: 技术文档
tag 		: nio
---

* content
{:toc}


Selector
=======================================

Selector是Java NIO中能够通过单线程管理多个NIO通道的组件，而在单线程下实现这个操作就必须需要异步才能实现。

在非NIO模式下，即jdk1.4之前的IO阻塞式IO(Blocking IO)下，传统的java socket监听解决方案是为每一个socket连接建立一个线程，并且在read()调用中阻塞，直到有数据读取进来。这事实上是把每个阻塞的线程当作socket监听器，把java虚拟机的线程调度当作通知机制来使用，很明显这是一种曲线救国的实现路线。毕竟线程的上下文切换还需要消耗额外的资源。所以并不是最高效的实现策略。

真正的就绪选择必须由操作系统来做。操作系统的一项最重要的功能就是处理I/O请求并通知各个线程它们的数据已经准备好了。选择器类提供了这种抽象，使得Java代码能够以可移植的方式，请求底层的操作系统提供就绪选择服务。


核心类
=======================================

Selector
---------------------

![/images/blog/java-nio/05-selector/01-class-selector.png](/images/blog/java-nio/05-selector/01-class-selector.png)

SelectableChannel
---------------------

![/images/blog/java-nio/05-selector/02-class-selectablechannel.png](/images/blog/java-nio/05-selector/02-class-selectablechannel.png)

SelectionKey
---------------------

![/images/blog/java-nio/05-selector/03-class-selectionkey.png](/images/blog/java-nio/05-selector/03-class-selectionkey.png)


使用方法
=======================================

创建Selector
---------------------

{% highlight java %}
Selector selector = Selector.open();
{% endhighlight %}

向Selector注册通道
---------------------

当向Selector中注册Channel时，Channel必须是非阻塞的，所以不可以注册FileChannel，因为FileChannel没有实现SelectableChannel接口，不能配置为非阻塞状态模式。

{% highlight java %}
channel.configureBlocking(false);
SelectionKey key = channel.register(selector, Selectionkey.OP_READ);
{% endhighlight %}

当将通道Channel注册到Selector中时，需要在第二个参数中指定相应观察事件的集合`interest集合`，即SelectionKey中的几个代表状态的整数。如果想注册多种状态需要用位或(`|`)操作符进行连接。

| SelectionKey.OP_CONNECT 	| 连接就绪 	|
| SelectionKey.OP_ACCEPT 	| 接收就绪	|
| SelectionKey.OP_READ 		| 读就绪	|
| SelectionKey.OP_WRITE 	| 写就绪	|

可以在注册完Channel到Selector之后，通过获取到的SelectionKey来获取ready集合`key.readyOps();`，即可以得到所观察事件是否就绪的一个位或操作之后的值，此时只需要使用相应的interest值与readyOps值取与(&)操作即可确定此事件是否就绪。或者使用JDK提供的四个API(而实际JDK底层代码也是取与操作进行判断的)如下：

{% highlight java %}
key.isConnectable();
key.isAcceptable();
key.isReadable();
key.isWritable();
{% endhighlight %}

SelectionKey中还可以添加一些附加对象来标识对应注册的是哪个Channel。方法有两种如下

{% highlight java %}
Object attach = new Object();
// 方法1：在注册时候的第三个参数指定
SelectionKey key = channel.register(selector, SelectionKey.OP_ACCEPT, attach);
// 方法2：使用attach()方法指定
key.attach(attach);

//获取附加对象的方法
Object attached = key.attachment();
{% endhighlight %}

选择通道
---------------------

当向Selector中注册了通道，就可以调用select来获取有多少通道发生了我们所感兴趣的(interest集合)事件和。该方法及其重载返回的int值表示有多少通道已经就绪。亦即，自上次调用select()方法后有多少通道变成就绪状态。如果调用select()方法，因为有一个通道变成就绪状态，返回了1，若再次调用select()方法，如果另一个通道就绪了，它会再次返回1。如果对第一个就绪的channel没有做任何操作，现在就有两个就绪的通道，但在每次select()方法调用之间，只有一个通道就绪了。

一旦select()方法返回非零，就可以通过`selector.selectedKeys()`方法获得所有的以选择即已就绪SelectionKey，通过遍历获取到是SelectionKey的哪个事件就绪。注意每次迭代末尾的keyIterator.remove()调用。Selector不会自己从已选择键集中移除SelectionKey实例。必须在处理完通道时自己移除。下次该通道变成就绪时，Selector会再次将其放入已选择键集中。

{% highlight java %}
// 阻塞到至少有一个通道在你注册的事件上就绪了。
selector.select();
// 和select()一样，除了最长会阻塞timeout毫秒(参数)。
selector.select(1000);
// 不会阻塞，不管什么通道就绪都立刻返回，如果无通道就绪，则立即返回零
selector.selectNow();

// 遍历就绪的SelectionKey
Set<SelectionKey> keys = selector.selectedKeys();
Iterator<SelectionKey> iterator = keys.iterator();
while (iterator.hasNext()) {
	SelectionKey selectedKey = iterator.next();
	if (key.isAcceptable()) {
		// a connection was accepted by a ServerSocketChannel.
	} else if (key.isConnectable()) {
		// a connection was established with a remote server.
	} else if (key.isReadable()) {
		// a channel is ready for reading
	} else if (key.isWritable()) {
		// a channel is ready for writing
	}
	iterator.remove();
}
{% endhighlight %}

唤醒Selector
---------------------

某个线程调用select()方法后阻塞了，即使没有通道已经就绪，也有办法让其从select()方法返回。只要让其它线程在第一个线程调用select()方法的那个对象上调用Selector.wakeup()方法即可。阻塞在select()方法上的线程会立马返回。

如果有其它线程调用了wakeup()方法，但当前没有线程阻塞在select()方法上，下个调用select()方法的线程会立即“醒来（wake up）”。

{% highlight java %}
selector.wakeup();
{% endhighlight %}

关闭Selector
---------------------

用完Selector后调用其close()方法会关闭该Selector，且使注册到该Selector上的所有SelectionKey实例无效。通道本身并不会关闭。

{% highlight java %}
selector.close();
{% endhighlight %}

Example
=======================================

SelectorServerTest
---------------------

{% highlight java %}
package com.freud.nio;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.text.MessageFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;

/**
 * @author Freud
 */
public class SelectorServerTest {

	public static void main(String[] args) throws Exception {

		Selector selector = null;
		ServerSocketChannel serverChannel = null;

		try {
			// 创建Selector
			selector = Selector.open();

			// 创建非阻塞Server Socket Channel
			serverChannel = ServerSocketChannel.open();
			serverChannel.configureBlocking(false);
			serverChannel.bind(new InetSocketAddress(7994));

			// 将ServerSocketChannel注册到Selector
			serverChannel.register(selector, SelectionKey.OP_ACCEPT);

			while (true) {
				// 等待信道超时，超时事件为1秒
				if (selector.select(3000) == 0) {
					System.out.println("等待中...");
					continue;
				}

				Iterator<SelectionKey> iterator = selector.selectedKeys()
						.iterator();
				while (iterator.hasNext()) {
					SelectionKey key = iterator.next();
					if (key.isConnectable()) {
						System.out.println("Connecable.");
					} else if (key.isAcceptable()) {
						System.out.println("Acceptedable.");
						handleAccept(key);
					} else if (key.isReadable()) {
						System.out.println("Readable.");
						handleRead(key);
					} else if (key.isValid() && key.isWritable()) {
						// Do nothing
						System.out.println("Writeable.");
						handleWrite(key);
					}
					iterator.remove();
				}
			}
		} catch (Exception e) {
			if (serverChannel != null) {
				serverChannel.close();
			}
			if (selector != null) {
				selector.close();
			}
		}
	}

	public static void handleAccept(SelectionKey key) throws IOException {
		// 接受客户端建立连接的请求
		SocketChannel clientChannel = ((ServerSocketChannel) key.channel())
				.accept();
		// 非阻塞式
		clientChannel.configureBlocking(false);
		// 注册到selector
		clientChannel.register(key.selector(), SelectionKey.OP_READ,
				ByteBuffer.allocate(1024));
		// clientChannel.register(key.selector(), SelectionKey.OP_READ
		// | SelectionKey.OP_WRITE, ByteBuffer.allocate(1024));
	}

	public static void handleRead(SelectionKey key) throws IOException {
		// 获得与客户端通信的信道
		SocketChannel clientChannel = (SocketChannel) key.channel();
		// 得到并清空缓冲区
		ByteBuffer buffer = (ByteBuffer) key.attachment();
		buffer.clear();
		if (clientChannel.read(buffer) != -1) {
			buffer.flip();
			byte[] bytes = new byte[buffer.limit()];
			int i = 0;
			while (buffer.hasRemaining()) {
				bytes[i] = buffer.get();
				i++;
			}
			System.out.println(MessageFormat.format("接收到来自[{0}]的消息[{1}]",
					clientChannel.getRemoteAddress(), new String(bytes)));
			buffer = ByteBuffer.wrap(MessageFormat.format(
					"你好,客户端. @[{0}]，已经收到你的信息[{1}]",
					new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")
							.format(new Date()), new String(bytes)).getBytes());
			clientChannel.write(buffer);
		} else {
			// 没有读取到内容的情况
			clientChannel.close();
		}
	}

	public static void handleWrite(SelectionKey key) throws IOException {
	}
}
{% endhighlight %}

SelectorClientTest
---------------------

{% highlight java %}
package com.freud.nio;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.SocketChannel;
import java.text.MessageFormat;
import java.util.Iterator;
import java.util.Scanner;
import java.util.concurrent.Executors;

/**
 * @author Freud
 */
public class SelectorClientTest implements Runnable {

	private Selector selector;

	public SelectorClientTest(Selector selector) {
		this.selector = selector;
	}

	@Override
	public void run() {
		try {
			// select()方法只能使用一次，用了之后就会自动删除,每个连接到服务器的选择器都是独立的
			while (selector.select() > 0) {
				Iterator<SelectionKey> iterator = selector.selectedKeys()
						.iterator();
				while (iterator.hasNext()) {
					SelectionKey key = iterator.next();
					if (key.isReadable()) {
						SocketChannel channel = (SocketChannel) key.channel();
						ByteBuffer buffer = ByteBuffer.allocate(1024);
						if (channel.read(buffer) != -1) {
							buffer.flip();
							byte[] bytes = new byte[buffer.limit()];
							int i = 0;
							while (buffer.hasRemaining()) {
								bytes[i] = buffer.get();
								i++;
							}
							System.out.println(MessageFormat
									.format("Server返回Response为[{0}]",
											new String(bytes)));
						} else {
							channel.close();
						}
					}
					iterator.remove();
				}
			}
		} catch (IOException e) {
			e.printStackTrace();
		}

	}

	public static void main(String[] args) throws Exception {
		Selector selector = null;
		SocketChannel channel = null;
		Scanner scanner = null;
		try {
			// 创建Selector
			selector = Selector.open();
			// 创建非阻塞Socket Channel
			channel = SocketChannel.open(new InetSocketAddress("127.0.0.1",
					7994));
			channel.configureBlocking(false);
			// channel.connect();

			channel.register(selector, SelectionKey.OP_READ
					| SelectionKey.OP_WRITE);

			System.out.print("Connection setting up.");
			while (!channel.isConnected()) {
				System.out.print(".");
				Thread.sleep(1000);
			}
			System.out.println();

			channel.write(ByteBuffer.wrap("Client startup..".getBytes()));

			// 监听Selector的各种事件
			Executors.newFixedThreadPool(1).submit(
					new SelectorClientTest(selector));

			while (true) {
				// 控制台输入信息发送给Server
				scanner = new Scanner(System.in);
				channel.write(ByteBuffer.wrap(scanner.next().getBytes()));
			}

		} finally {
			if (scanner != null) {
				scanner.close();
			}
			if (channel != null) {
				channel.close();
			}
			if (selector != null) {
				selector.close();
			}
		}
	}
}
{% endhighlight %}

Server端测试输出
---------------------

{% highlight text %}
等待中...
等待中...
Acceptedable.
Readable.
接收到来自[/127.0.0.1:52836]的消息[Client startup..]
等待中...
Readable.
接收到来自[/127.0.0.1:52836]的消息[echo1]
等待中...
Readable.
接收到来自[/127.0.0.1:52836]的消息[echo2]
Readable.
接收到来自[/127.0.0.1:52836]的消息[echo3]
Readable.
接收到来自[/127.0.0.1:52836]的消息[echo4]
Readable.
{% endhighlight %}

Client端测试输入与输出
---------------------

{% highlight text %}
Connection setting up.
Server返回Response为[你好,客户端. @[2017-04-21 18:00:24]，已经收到你的信息[Client startup..]]
echo1
Server返回Response为[你好,客户端. @[2017-04-21 18:00:27]，已经收到你的信息[echo1]]
echo2
Server返回Response为[你好,客户端. @[2017-04-21 18:00:30]，已经收到你的信息[echo2]]
echo3
Server返回Response为[你好,客户端. @[2017-04-21 18:00:32]，已经收到你的信息[echo3]]
echo4
Server返回Response为[你好,客户端. @[2017-04-21 18:00:35]，已经收到你的信息[echo4]]
{% endhighlight %}


参考资料
=======================================

JAVA-NIO(英文版) - Ron Hitchens

JAVA-NIO(中文版) - Ron Hitchens(著) 裴小星(译)

Java nio tutorial : [http://tutorials.jenkov.com/java-nio/index.html](http://tutorials.jenkov.com/java-nio/index.html)

并发编程网：Java NIO系列教程-中文翻译版 : [http://ifeve.com/overview/](http://ifeve.com/overview/)