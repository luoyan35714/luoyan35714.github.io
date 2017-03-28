---
layout 		: post
title 		: Java NIO系列学习笔记（二） - Buffer
date 		: 2017-03-28 14:56:01 +0800
categories 	: 技术文档
tag 		: nio
---

* content
{:toc}

Buffer
=======================================

上一节中已经讲过，Buffer有如下几种，其中最常用的是ByteBuffer:

![/images/blog/java-nio/01-introduction/02-buffer-hierarchy.png](/images/blog/java-nio/01-introduction/02-buffer-hierarchy.png)


Buffer用法示例
=======================================

ByteBufferTest.txt
--------------------------------

{% highlight text %}
Hello World!
{% endhighlight %}

ByteBufferTest.java
--------------------------------

{% highlight java %}
package com.freud.nio;

import java.io.File;
import java.io.RandomAccessFile;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;

/**
 * @author Freud
 */
public class ByteBufferTest {

	public static void main(String[] args) throws Exception {
		RandomAccessFile file = new RandomAccessFile(new File(
				"resources/ByteBufferTest.txt"), "rw");
		FileChannel channel = file.getChannel();
		ByteBuffer buffer = ByteBuffer.allocate(10);
		int index = channel.read(buffer);
		while (index != -1) {
			buffer.flip();
			print1(buffer);
			print2(buffer);
			buffer.clear();
			index = channel.read(buffer);
		}
		channel.close();
		file.close();
	}

	/**
	 * 打印ByteBuffer中所有的字节
	 */
	private static void print1(ByteBuffer buffer) {
		System.out.print("Print by print1 : ");
		for (byte b : buffer.array()) {
			System.out.print((char) b);
		}
		System.out.println();
	}

	/**
	 * 按照字节逐个打印
	 */
	private static void print2(ByteBuffer buffer) {
		System.out.print("Print by print2 : ");
		while (buffer.hasRemaining()) {
			System.out.print((char) buffer.get());
		}
		System.out.println();
	}
}
{% endhighlight %}

输出结果
--------------------------------

{% highlight text %}
Print by print1 : Hello Worl
Print by print2 : Hello Worl
Print by print1 : d!llo Worl
Print by print2 : d!
{% endhighlight %}

分析
--------------------------------

以上源码中使用RandomAccessFile读取了本地磁盘的一个文件，通过FileChannel写入到ByteBuffer中，再从ByteBuffer中打印到输出控制台上。

但很明显的可以看到方法print1的第二次打印明显不是我们预期的结果，产生这个结果的原因正是ByteBuffer的数据模型造成的。在下面的介绍中我们会详细介绍产生的原因。


mark position limit capacity
=======================================

Buffer分为读模式(从Buffer中读取数据)和写模式(写数据到Buffer中)，模式的切换是通过flip来实现的，在不同的模式下position和limit的概念是不同的，而capacity和mark是相同的。

| position	| 当写模式下时，position当前位置，初始的position值为0.当一个byte、long等数据写到Buffer后， position会向前移动到下一个可插入数据的Buffer单元。position最大可为capacity–1；在读模式下时，也是从某个特定位置读。当将Buffer从写模式切换到读模式，position会被重置为0. 当从Buffer的position处读取数据时，position向前移动到下一个可读的位置。 |
| limit		| 在写模式下，Buffer的limit表示你最多能往Buffer里写多少数据。 写模式下，limit等于Buffer的capacity。|
| capacity	| 作为一个内存块，Buffer有一个固定的大小值，也叫“capacity”.你只能往里写capacity个byte、long，char等类型。一旦Buffer满了，需要将其清空（通过读数据或者清除数据）才能继续写数据往里写数据。|
| mark 		| 标记，可以通过mark()方法记录当前position值，然后通过reset()方法可以使position重新回到mark的位置，而clear()、rewind()、flip()方法总是会重置mark为初始状态-1 |



参考资料
=======================================

JAVA-NIO(英文版) - Ron Hitchens

JAVA-NIO(中文版) - Ron Hitchens(著) 裴小星(译)

Java nio tutorial : [http://tutorials.jenkov.com/java-nio/index.html](http://tutorials.jenkov.com/java-nio/index.html)

并发编程网：Java NIO系列教程-中文翻译版 : [http://ifeve.com/overview/](http://ifeve.com/overview/)