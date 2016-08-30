---
layout: post
title:  Mysql在Linux环境下yum方式安装和配置
date:   2015-10-21 10:49:00 +0800
categories: 技术文档
tag: Mysql
---

* content
{:toc}


Mysql安装
------------------------------

+ Linux环境信息
{% highlight bash %}
[root@localhost ~]# cat /proc/version 
Linux version 2.6.32-431.el6.x86_64 (mockbuild@c6b8.bsys.dev.centos.org) (gcc version 4.4.7 20120313 (Red Hat 4.4.7-4) (GCC) ) #1 SMP Fri Nov 22 03:15:09 UTC 2013
[root@localhost ~]# uname -a
Linux localhost.localdomain 2.6.32-431.el6.x86_64 #1 SMP Fri Nov 22 03:15:09 UTC 2013 x86_64 x86_64 x86_64 GNU/Linux
[root@localhost ~]# uname -r
2.6.32-431.el6.x86_64
[root@localhost ~]# lsb_release -a
LSB Version:	:base-4.0-amd64:base-4.0-noarch:core-4.0-amd64:core-4.0-noarch:graphics-4.0-amd64:graphics-4.0-noarch:printing-4.0-amd64:printing-4.0-noarch
Distributor ID:	CentOS
Description:	CentOS release 6.5 (Final)
Release:	6.5
Codename:	Final
{% endhighlight %}

+ 下载mysql的Yum源下载
{% highlight bash %}
[root@localhost ~]# wget http://repo.mysql.com/mysql-community-release-el7-5.noarch.rpm
[root@localhost ~]# sudo rpm -ivh mysql-community-release-el7-5.noarch.rpm
{% endhighlight %}

+ 如果存在则删除
{% highlight bash %}
[root@localhost ~]# yum list installed | grep mysql
[root@localhost ~]# yum -y remove mysql-libs.x86_64
[root@localhost ~]# yum list | grep mysql 或 yum -y list mysql*
{% endhighlight %}

+ 安装
{% highlight bash %}
[root@localhost ~]# yum -y install mysql-server mysql mysql-devel 
{% endhighlight %}

+ 查看安装的Mysql版本
{% highlight bash %}
[root@localhost ~]# rpm -qi mysql-server
{% endhighlight %}

+ 设置用户和权限
{% highlight bash %}
[root@localhost ~]# chgrp -R mysql /var/lib/mysql
[root@localhost ~]# chmod -R 770 /var/lib/mysql
[root@localhost ~]# service mysqld start 
{% endhighlight %}

+ Mysql设置本地用户和远程用户登录
{% highlight bash %}
[root@localhost ~]# mysql
$ mysql > use mysql;
$ mysql > grant all on *.* to 'root'@'localhost' identified by 'root';
$ mysql > grant all on *.* to 'root'@'%' identified by 'root';
$ mysql > flush privileges;    
{% endhighlight %}

+ 修改Mysql在linux下大小写不敏感
{% highlight bash %}
[root@localhost ~]#vi /etc/my.cnf
# 在[mysqld]后添加如下行，0代表大小写敏感，1代表不敏感
lower_case_table_names= 0
[root@localhost ~]# service mysqld restart 
{% endhighlight %}

+ 开放3306端口,修改文件
{% highlight bash %}
[root@localhost ~]#sudo vim /etc/sysconfig/iptables
{% endhighlight %}

+ 在文件中添加如下行
{% highlight bash %}
*filter
:INPUT ACCEPT [0:0]
:FORWARD ACCEPT [0:0]
:OUTPUT ACCEPT [0:0]
-A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
-A INPUT -p icmp -j ACCEPT
-A INPUT -i lo -j ACCEPT
-A INPUT -m state --state NEW -m tcp -p tcp --dport 22 -j ACCEPT
-A INPUT -m state --state NEW -m tcp -p tcp --dport 80 -j ACCEPT
-A INPUT -m state --state NEW -m tcp -p tcp --dport 3306 -j ACCEPT
-A INPUT -j REJECT --reject-with icmp-host-prohibited
-A FORWARD -j REJECT --reject-with icmp-host-prohibited
COMMIT
{% endhighlight %}

+ 重启防火墙
{% highlight bash %}
[root@localhost ~]# sudo service iptables restart
{% endhighlight %}

+ 在Linode上会报错
{% highlight bash %}
[root@li254-129 ~]# service iptables restart
iptables: Setting chains to policy ACCEPT: security raw nat[FAILED]filter 
iptables: Flushing firewall rules:                         [  OK  ]
iptables: Unloading modules:                               [  OK  ]
iptables: Applying firewall rules:                         [  OK  ]
{% endhighlight %}

+ 原因是：Linode官方在iptables里加了一个security的规则链，但是centos不支持。

+ 解决办法
{% highlight bash %}
#找到如下case段,在raw后面加上security)段，修改后如下。
[root@li254-129 ~]# vim /etc/init.d/iptables 
for i in $tables; do
 echo -n "$i "
 case "$i" in
 raw)
 $IPTABLES -t raw -P PREROUTING $policy \
 && $IPTABLES -t raw -P OUTPUT $policy \
 || let ret+=1
 ;;
security)
 $IPTABLES -t filter -P INPUT $policy \
 && $IPTABLES -t filter -P OUTPUT $policy \
 && $IPTABLES -t filter -P FORWARD $policy \
 || let ret+=1
 ;;
{% endhighlight %}

+ 下载安装java
{% highlight bash %}
# 下载安装JDK
wget http://download.oracle.com/otn-pub/java/jdk/8u77-b03/jdk-8u77-linux-x64.rpm?AuthParam=1458919543_9b2e065bf9d967bdd1b416b3f5935302
rpm -ivh jdk-8u77-linux-x64.rpm
# 下载安装TOMCAT
wget  wget http://mirrors.cnnic.cn/apache/tomcat/tomcat-8/v8.0.32/bin/apache-tomcat-8.0.32.tar.gz
{% endhighlight %}

+ 配置java路径
{% highlight bash %}
[root@localhost ~]# vi /etc/profile
export JAVA_HOME=/usr/java/jdk1.6.0_27
export PATH=$PATH:$JAVA_HOME/bin
[root@localhost ~]# source /etc/profile
{% endhighlight %}


<br />
<br />

参考资料：
-------------------------------------
yum安装MySQL并设置密码：[http://www.cnblogs.com/xiaochaohuashengmi/archive/2011/10/16/2214272.html](http://www.cnblogs.com/xiaochaohuashengmi/archive/2011/10/16/2214272.html)

centos7下使用yum安装mysql并创建用户，数据库以及设置远程访问：[http://my.oschina.net/fhd/blog/383847](http://my.oschina.net/fhd/blog/383847)

<br />
<br />