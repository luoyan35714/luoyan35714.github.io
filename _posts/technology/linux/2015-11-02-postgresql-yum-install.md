---
layout: post
title:  Postgresql在Linux环境下yum方式安装和配置
date:   2015-11-02 09:29:00 +0800
categories: 技术文档
tag: Postgresql
---

* content
{:toc}


Yum安装
===============	

* 安装Yum源

{% highlight bash %}
[root@localhost ~]# yum install http://yum.postgresql.org/9.4/redhat/rhel-6-x86_64/pgdg-redhat94-9.4-1.noarch.rpm 
{% endhighlight %}

* Yum安装

{% highlight bash %}
[root@localhost ~]# yum install postgresql94-server postgresql94-contrib
{% endhighlight %}

初始化数据库，并启动数据库
===============
	
{% highlight bash %}
[root@localhost ~]# service postgresql-9.4 initdb
[root@localhost ~]# service postgresql-9.4 start
{% endhighlight %}


把PostgreSQL 服务加入到启动列表
===============
	
{% highlight bash %}
[root@localhost ~]# chkconfig postgresql-9.4 on 
[root@localhost ~]# chkconfig --list|grep postgres
{% endhighlight %}

修改PostgreSQL 数据库用户postgres的密码, 并创建数据库和测试数据
===============

{% highlight bash %}
[root@localhost ~]# su postgres 
[root@localhost ~]# psql 
# ALTER USER postgres WITH PASSWORD 'postgres';
# select * from pg_shadow ;	
# create database david;
# \c david
# create table test (id integer, name text);
# insert into test values (1,'david');
# select * from test ; 
{% endhighlight %}

修改linux 系统用户postgres 的密码
===============

{% highlight bash %}
[root@localhost ~]# passwd postgres
{% endhighlight %}

修改PostgresSQL 数据库配置实现远程访问
===============

* 修改postgresql.conf 文件，如果想让PostgreSQL 监听整个网络的话，将listen_addresses 前的#去掉，并将 listen_addresses = 'localhost' 改成 listen_addresses = '*'

{% highlight bash %}
[root@localhost ~]# vi /var/lib/pgsql/9.2/data/postgresql.conf
{% endhighlight %}

* 修改客户端认证配置文件pg_hba.conf，在IPV4下面添加一条记录"host  all    all    10.1.5.0/24    md5"，其中10.1.5.0代表网段'10.1.5.*', 24是子网掩码，代表10.1.5.0-10.1.5.255, md5代表使用md5加密

{% highlight bash %}
[root@localhost ~]# vi /var/lib/pgsql/9.2/data/pg_hba.conf
{% endhighlight %}


* <b>远程连接测试，默认端口是5432 - 成功


<br />
<br />

参考资料：
===========================

CentOS 6.3下PostgreSQL 的安装与配置：[http://www.cnblogs.com/mchina/archive/2012/06/06/2539003.html](http://www.cnblogs.com/mchina/archive/2012/06/06/2539003.html)

PostgreSQL 9.4.5 Documentation : [http://www.postgresql.org/docs/9.4/interactive/index.html](http://www.postgresql.org/docs/9.4/interactive/index.html)

Linux downloads (Red Hat family) : [http://www.postgresql.org/download/linux/redhat/](http://www.postgresql.org/download/linux/redhat/)

<br />
<br />