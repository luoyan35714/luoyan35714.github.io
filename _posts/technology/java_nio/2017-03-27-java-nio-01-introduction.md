---
layout		: post
title 		: Java NIO系列（一） - Java NIO 概述
date 		: 2017-03-27 20:40:01 +0800
categories 	: 技术文档
tag			: nio
---

* content
{:toc}


概述
=======================================

Java NIO(Java Non-blocking IO)是在JDK1.4中提供的非阻塞IO实现。

Java NIO主要由三大核心部分组成：

+ Buffer
+ Cahnnel
+ Selector

当然Java NIO还有其他一些组件，比如Pipe，FileLock，不过是与三个核心组件组合使用的工具类，并且对于FileLock来说，在分布式系统设计下，我们需要保证分布式文件锁，所以单一的单进程锁的方式已经没有太多的用武之地。

传统的IO(JDK1.4之前的IO，又称为BIO即Blocking IO)是面向流的，而NIO是面向缓冲区的。Java IO面向流意味着每次从流中读一个或多个字节，直至读取所有字节，它们没有被缓存在任何地方。此外，它不能前后移动流中的数据。如果需要前后移动从流中读取的数据，需要先将它缓存到一个缓冲区。NIO的缓冲导向方法略有不同。数据读取到一个它稍后处理的缓冲区，需要时可在缓冲区中前后移动。这就增加了处理过程中的灵活性。但是，还需要检查是否该缓冲区中包含所有您需要处理的数据。而且，需确保当更多的数据读入缓冲区时，不要覆盖缓冲区里尚未处理的数据。


Channel 和 Buffer
=======================================

由于Java NIO被设计为面向缓冲区的操作，所以Java NIO中所有的数据操作都从Channel开始，数据可以从Channel读取到Buffer中，也可以从Buffer中写入到Channel，当然整个过程既支持同步操作，也支持异步操作。

![/images/blog/java-nio/01-introduction/01-overview-channels-buffers.png](/images/blog/java-nio/01-introduction/01-overview-channels-buffers.png)

Channel主要有四种：

+ FileChannel : 文件管道 
+ SocketChannel : TCPClient管道 
+ ServerSocketChannel : TCPServer管道 
+ DatagramChannel : UDP管道 

Buffer有如下几种，但是经常使用的是ByteBuffer:

+ ByteBuffer
+ CharBuffer
+ DoubleBuffer
+ FloatBuffer
+ IntBuffer
+ LongBuffer
+ ShortBuffer

![/images/blog/java-nio/01-introduction/02-buffer-hierarchy.png](/images/blog/java-nio/01-introduction/02-buffer-hierarchy.png)


Selector
=======================================

Selector允许在单线程中处理多个Channel，适用于当你的应用需要连接多个通道，但是每个通道流量都很低的情况。

下图是一个单线程使用一个Selector处理三个Channel的情景:

![/images/blog/java-nio/01-introduction/03-overview-selectors.png](/images/blog/java-nio/01-introduction/03-overview-selectors.png)


参考资料
=======================================

《JAVA-NIO(英文版)》 - Ron Hitchens

《JAVA-NIO(中文版)》 - Ron Hitchens(著) 裴小星(译)

Java nio tutorial : [http://tutorials.jenkov.com/java-nio/index.html](http://tutorials.jenkov.com/java-nio/index.html)

并发编程网：Java NIO系列教程-中文翻译版 : [http://ifeve.com/overview/](http://ifeve.com/overview/)