---
layout: post
title:  Hadoop 学习笔记之(十) - Hadoop输入和输出
date:   2015-05-14 15:21:00 +0800
categories: 技术文档
tag: Hadoop
---

* content
{:toc}


Hadoop的输入
---------------------------------

* 在执行Mapreduce之前，原始数据被分割成若干个Split,每个Split作为一个Map任务的输入，在Map执行过程中Split会被分解成一个个的Key-Value记录。Map会依次处理每一条记录
* 输入文件的Split
	+ FileInputFormat只划分比HDFS Block大的文件，所以FileInputFormat划分的结果是这个文件或者是这个文件中的一部分。
	+ 如果一个文件的大小比Block小，将不会被划分，这也是Hadoop处理打文件的效率要比处理很多小文件的效率高的原因
	+ 当Hadoop处理很多小文件(文件大小小于HDFS block大小)的时候，由于FileInputFormat不会对小文件进行划分，所以每一个小文件都会被当作一个Split并分配一个Map任务，导致效率低下。
	+ 例如：1G的文件默认会被分成16个64M的Split，并分配16个map任务处理，而10000个100Kb的文件会被分配10000个map任务处理
* Hadoop自带的输入类
	+ TextInputFormat
		- 是默认的InputFormat
		- 文件中每一行作为一个记录，每一行在文件中的起始偏移量作为Key，每一行的内容作为value。
		- 默认以\n或回车键作为一行记录
	+ CombineFileInputFormat
		- 是一种新的inputformat，将多个文件合并成一个单独的split,另外，它会考虑数据的存储位置，相对于大量的小文件来说，hadoop更合适处理少量的大文件，CombineFileInputFormat可以缓解这个问题，它是针对小文件而设计的
	+ KeyValueTextInputFormat
		- 当输入数据的每一行是两列，并用tab分离的形式的时候，KeyValueTextInputFormat处理这种格式的文件非常适合
	+ NLineInputFormat
		- NLineInputFormat可以控制在每个Split中数据的行数
	+ 自定义FileInputFormat
		- 继承FileInputFormat基类
		- 重写isSplitable方法
		- 重写createRecordReader()方法

Hadoop的输出
---------------------------------

* TextOutputFormat
	+ 默认的输出格式，key和value中间值用tab隔开
* MapFileOutputFormat
	+ 将Key和value写入MapFile中，由于MapFile中的key是有序的。所以写的时候必须保证记录是按照Key值顺序写入的
* MultipleOutputFormat
	+ 默认情况下一个reducer会产生一个输出，但是有些时候我们像一个reducer产生多个输出，MultipleOutputFormat和MultipleOutputs可以实现这个功能。
* MapReduce输出进行压缩

|Mapred.compress.map.output|Boolean|False|
|Mapred.map.output.compression.codec|Class|Org.apache.hadoop.io.compress.DefaultCodec|

两种方式实现

+ 在程序中运用

{% highlight java %}
Configuration conf = new Configuration();
Conf.setBoolean(“mapred.compress.map.output”，true)；
Conf.setClass(“Mapred.map.output.compression.codec”, GzipCodec.class, CompressionCodec.class)
{% endhighlight %}

+ 在配置文件中修改mapred-site.xml

|Mapred.compress.map.output|True|
|Mapred.map.output.compression.codec|GzipCodec.class, CompressionCodec.class|

<br />
<br />

参考资料
=======================

Hadoop官方文档 : [http://hadoop.apache.org/docs/r1.0.4/cn/quickstart.html](http://hadoop.apache.org/docs/r1.0.4/cn/quickstart.html)
<br />

陆嘉恒 : 《Hadoop实战》 第2版

<br />
<br />