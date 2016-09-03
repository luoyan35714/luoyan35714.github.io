---
layout: post
title:  Hadoop 学习笔记之(五) - HDFS - PathFilter
date:   2015-03-27 11:13:00 +0800
categories: 技术文档
tag: Hadoop
---

* content
{:toc}


文件过滤
=================================

* Hadoop支持基于Linux的`所有通配符`比如 `*`

* 自定义`PathFilter`
	* 实现PathFilter接口
	* 实现accept方法
		{% highlight java %}
			public boolean accept(Path path);
		{% endhighlight %}

	* 符合过滤条件的返回true，不符合的返回false
	* `FileSystem.globStatus (Path, PathFilter)`;
	* `FileInputFormat.setInputPathFilter(Job, PathFilter)`

<br />
<br />

参考资料
=======================

Hadoop官方文档 : [http://hadoop.apache.org/docs/r1.0.4/cn/quickstart.html](http://hadoop.apache.org/docs/r1.0.4/cn/quickstart.html)
<br />

陆嘉恒 : 《Hadoop实战》 第2版

<br />
<br />