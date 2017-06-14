---
layout:			post
title:			Zookeeper学习笔记之(十七) - 我的开源zookeeper_admin *
date:			2017-01-19 10:20:00 +0800
categories:		技术文档
tag:			zookeeper
---

* content
{:toc}


简介
==================

Zookeeper_admin [![Build Status](https://travis-ci.org/luoyan35714/zookeeper_admin.svg?branch=master)](https://travis-ci.org/luoyan35714/zookeeper_admin) 是一款基于Java EE的Zookeeper后台管理系统。实现了对Zookeeper实例的统一管理。

前台使用了`Bootstrap`，基于`gentelella`主题实现。后台使用了`Spring MVC`，`Mybatis`，`Curator`等技术。Jar包管理通过`Maven`来实现。数据库选用了`Mysql`。


下载安装
==================

下载
------------------

通过如下命令从github下载本项目代码。

{% highlight bash %}
git clone https://github.com/luoyan35714/zookeeper_admin.git
{% endhighlight %}

导入IDE
------------------

由于项目是通过Maven进行管理，所以在导入Eclipse的时候，选择Maven项目


初始化数据库
------------------

启动
------------------

新建实例
==================

实例管理
==================

实例详情
==================

基本操作
------------------

修改操作
------------------

权限管理
------------------

查看ACL管理
------------------

ACL管理
------------------

<br />
<br />
