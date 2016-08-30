---
layout: post
title:  Hadoop 学习笔记之(三) - [转] cloudera manager 卸载
date:   2015-03-12 16:58:00 +0800
categories: 技术文档
tag: Hadoop
---

* content
{:toc}


4.x卸载 - [http://ju.outofmemory.cn/entry/22477](http://ju.outofmemory.cn/entry/22477)
=================

记录卸载过程和问题。现有环境Cloudera Manager + (1 + 2 )的CDH环境。

+ 先在Manage管理端移除所有服务。
+ 删除Manager Server,在Manager节点运行
{% highlight text %}
$ sudo /usr/share/cmf/uninstall-cloudera-manager.sh
{% endhighlight %}

+ 如果没有该脚本，则可以手动删除，先停止服务：
{% highlight text %}
sudo service cloudera-scm-server stop
sudo service cloudera-scm-server-db stop
{% endhighlight %}

+ 然后删除：
{% highlight text %}
sudo yum remove cloudera-manager-server
sudo yum remove cloudera-manager-server-db
{% endhighlight %}

+ 删除所有CDH节点上的CDH服务，先停止服务：
{% highlight text %}
sudo service cloudera-scm-agent hard_stop
{% endhighlight %}

+ 卸载安装的软件：
{% highlight text %}
sudo yum remove 'cloudera-manager-*' hadoop hue-common 'bigtop-*'
{% endhighlight %}

+ 删除残余数据：
{% highlight text %}
sudo rm -Rf /usr/share/cmf /var/lib/cloudera* /var/cache/yum/cloudera*
{% endhighlight %}

+ kill掉所有Manager和Hadoop进程（选作，如果你正确停止Cloud Manager和所有服务则无须此步）
{% highlight text %}
$ for u in hdfs mapred cloudera-scm hbase hue zookeeper oozie hive impala flume; do sudo kill $(ps -u $u -o pid=); done
{% endhighlight %}

+ 删除Manager的lock文件,在Manager节点运行：
{% highlight text %}
sudo rm /tmp/.scm_prepare_node.lock
{% endhighlight %}

+ 至此，删除完成。

5.x卸载 - [http://www.aboutyun.com/thread-8949-1-1.html](http://www.aboutyun.com/thread-8949-1-1.html)
=================

> 操作的系统是Centos OS6.3

+ 操作需要root权限，先切换root
{% highlight text %}
  sudo su –
{% endhighlight %}

+ 卸载Cloudera-Manager
{% highlight text %}
    sudo /usr/share/cmf/uninstall-cloudera-manager.sh
{% endhighlight %}

一直选择Yes就好,卸载完成后，它会问你是否要将database里的数据清理，选择Yes

+ 按照官方的介绍，删除cloudera的安装目录
{% highlight text %}
    sudo rm -rf /usr/share/cmf /var/lib/cloudera* /var/cache/yum/x86_64/6/cloudera* /var/log/cloudera* /var/run/cloudera*
{% endhighlight %}

这里我吐槽一下，还有一个数据库配置文件没有清理干净，导致我后面重新安装服务时，老是说出错
{% highlight text %}
    rm -rf /etc/cloudera*
{% endhighlight %}

+ 卸载cloudera的rpm包

查看安装了那些包
{% highlight text %}
rpm -qa | grep cloudera
{% endhighlight %}

然后逐个将其删除
{% highlight text %}
for f in `rpm -qa | grep cloudera `  ; do rpm -e ${f} ; done
{% endhighlight %}

+ 清理Cloudera相关文件
{% highlight text %}
sudo rm -rf /var/lib/flume-ng /var/lib/hadoop* /var/lib/hue /var/lib/oozie /var/lib/solr /var/lib/sqoop*
{% endhighlight %}

{% highlight text %}
sudo rm -rf /dfs /mapred /yarn
{% endhighlight %}

{% highlight text %}
rm -rf /var/run/hadoop* /var/run/flume-ng /var/run/cloudera* /var/run/oozie/ /var/run/sqoop2 /var/run/zookeeper /var/run/hbase /var/run/impala /var/run/hive /var/run/hdfs-sockets
{% endhighlight %}

{% highlight text %}
rm -rf /usr/lib/hadoop /usr/lib/hadoop* /usr/lib/hive /usr/lib/hbase /usr/lib/oozie /usr/lib/sqoop* /usr/lib/zookeeper /usr/lib/bigtop* /usr/lib/flume-ng /usr/lib/hcatalog
{% endhighlight %}

{% highlight text %}
rm -rf /usr/bin/hadoop* /usr/bin/zookeeper* /usr/bin/hbase* /usr/bin/hive* /usr/bin/hdfs /usr/bin/mapred /usr/bin/yarn /usr/bin/sqoop* /usr/bin/oozie
{% endhighlight %}

{% highlight text %}
rm -rf /etc/alternatives/*
{% endhighlight %}

{% highlight text %}
rm -rf /etc/hadoop* /etc/zookeeper* /etc/hive* /etc/hue /etc/impala /etc/sqoop* /etc/oozie /etc/hbase* /etc/hcatalog
{% endhighlight %}

+ 还有一个很重要的路径，之前从cdh4.5 update 到cdh5，一直有软链接到旧的4.5的目录，找了很久，终于在strace工具帮助下找到了问题所在。
{% highlight text %}
rm -rf /var/lib/alternatives/{cdh.app}
{% endhighlight %}

简单的删除/var/lib/alternatives/* 下所有的文件是有风险的，由于系统可能还使用了alternatives做了其他的工具版本控制，所以楼主建议是挑出cdh相关的文件删除。

+ 杀死相关的进程
{% highlight text %}
for u in hdfs mapred cloudera-scm hbase hue zookeeper oozie hive impala flume; do sudo kill $(ps -u $u -o pid=); done
{% endhighlight %}

+ 删除 Cloudera Manager的lock file
{% highlight text %}
sudo rm /tmp/.scm_prepare_node.lock
{% endhighlight %}

+ 删除parcel 包分发文件和解压文件
{% highlight text %}
rm -rf /opt/cloudera/parcel-cache /opt/cloudera/parcels
{% endhighlight %}

<br />
<br />
