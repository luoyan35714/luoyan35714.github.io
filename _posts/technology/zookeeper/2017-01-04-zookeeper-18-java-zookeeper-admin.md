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

![/images/blog/zookeeper/17-zookeeper-admin/01.png](/images/blog/zookeeper/17-zookeeper-admin/01.png)

![/images/blog/zookeeper/17-zookeeper-admin/02.png](/images/blog/zookeeper/17-zookeeper-admin/02.png)

其中文件夹目录作用解释如下：

+ `src/main/java` : 项目后台Java代码
+ `src/main/resources` : 项目配置文件
+ `src/test/java` : 测试代码，其中主要是针对Zookeeper的各种操作Demo
+ `src/main/webapp` : 项目的前台代码
+ `doc` : 项目SQL文件存放目录

初始化数据库
------------------

执行`doc/zk_2017-06-09.sql`在数据库中创建数据库`zk_admin`并初始化相关的表结构。

启动
------------------

添加项目到Tomcat下，并启动Tomcat。

![/images/blog/zookeeper/17-zookeeper-admin/03.png](/images/blog/zookeeper/17-zookeeper-admin/03.png)

![/images/blog/zookeeper/17-zookeeper-admin/04.png](/images/blog/zookeeper/17-zookeeper-admin/04.png)


新建实例
==================

启动相关的zookeeper，点击左侧`添加实例`，正确填写`Name`,`IP`,`Port`相关信息，并保存。

![/images/blog/zookeeper/17-zookeeper-admin/05.png](/images/blog/zookeeper/17-zookeeper-admin/05.png)


实例管理
==================

点击左侧`实例列表`会出现所有录入的Zookeeper实例，可以点击`详情`，`更新`或者`删除`执行相关操作。

![/images/blog/zookeeper/17-zookeeper-admin/06.png](/images/blog/zookeeper/17-zookeeper-admin/06.png)


实例详情
==================

点击左侧`Zookeeper实例`下的相关Zookeeper实例，右侧会出现Zookeeper的详细信息。

![/images/blog/zookeeper/17-zookeeper-admin/07.png](/images/blog/zookeeper/17-zookeeper-admin/07.png)

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
