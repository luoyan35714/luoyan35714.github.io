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

{% highlight java %}
{% endhighlight %}

选择通道
---------------------

{% highlight java %}
{% endhighlight %}

唤醒Selector
---------------------

{% highlight java %}
{% endhighlight %}

关闭Selector
---------------------

{% highlight java %}
{% endhighlight %}

Example
=======================================

{% highlight java %}
{% endhighlight %}

参考资料
=======================================


参考资料
=======================================

JAVA-NIO(英文版) - Ron Hitchens

JAVA-NIO(中文版) - Ron Hitchens(著) 裴小星(译)

Java nio tutorial : [http://tutorials.jenkov.com/java-nio/index.html](http://tutorials.jenkov.com/java-nio/index.html)

并发编程网：Java NIO系列教程-中文翻译版 : [http://ifeve.com/overview/](http://ifeve.com/overview/)