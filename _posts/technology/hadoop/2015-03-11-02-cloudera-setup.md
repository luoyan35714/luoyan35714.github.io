---
layout: post
title:  Hadoop 学习笔记之(二) - cloudera 5.0.1 安装
date:   2015-03-11 15:16:00 +0800
categories: 技术文档
tag: Hadoop
---

* content
{:toc}


> Cloudera搭建分为两部分，第一部分是Cloudera Manager的安装过程，第二部分为CDH的安装

第一部分：CM安装
=================================

+ 设置IP 

{% highlight text %}
vi /etc/sysconfig/network-scripts/ifcfg-eth0
{% endhighlight %}

![change ip](/images/blog/hadoop/02-cloudera-setup/01-change-ip.png)

+ 在命令行中使用ifconfig查看当前ip, 确保我们刚才的设置已经生效

![check ip](/images/blog/hadoop/02-cloudera-setup/02-check-ip.png)

+ 设置Host文件, 编辑/etc/hosts文件，设置IP地址与机器名的映射，设置信息如下(如果有多台节点，请将所有的IP和机器名映射写上)：`10.1.5.120 hadoop001`

![设置机器名映射](/images/blog/hadoop/02-cloudera-setup/03-set-host-mapping.png)

+ 使用如下命令对网络设置进行重启

{% highlight text %}
sudo /etc/init.d/network restart
{% endhighlight %}

+ 验证是否成功

![检查机器名映射是否成功](/images/blog/hadoop/02-cloudera-setup/04-check-host-mapping.png)

+ 关闭防火墙（永久），执行该命令后重启机器生效

{% highlight text %}
chkconfig iptables off
{% endhighlight %}

+ 查看防火墙状态

{% highlight text %}
service iptables status 
{% endhighlight %}

![查看防火墙状态](/images/blog/hadoop/02-cloudera-setup/05-check-iptables-status.png)

以上表示已经关闭

+ 关闭SElinux，修改/etc/selinux/config文件，将SELINUX=enforcing改为SELINUX=disabled，执行该命令后重启机器生效

![关闭SElinux](/images/blog/hadoop/02-cloudera-setup/06-close-selinux.png)

+ 使用如下命令查看是否关闭 getenforce

![查看SElinux关闭状态](/images/blog/hadoop/02-cloudera-setup/07-check-selinux-status.png)

+ 设置机器名，以root用户登录，使用 vi /etc/sysconfig/network 打开配置文件，修改主机名称为hadoop001

![设置机器名](/images/blog/hadoop/02-cloudera-setup/08-setup-hostname.png)

+ SSH无密码验证配置，切到./ssh目录
	* 生成私钥和公钥: `ssh-keygen –t rsa`
	* 把公钥信息保存到authorized_key文件中 `$cp id_rsa.pub authorized_keys `

+ 下载Cloudera installer 5.0.1
[http://archive.cloudera.com/cm5/installer/5.0.1/cloudera-manager-installer.bin](http://archive.cloudera.com/cm5/installer/5.0.1/cloudera-manager-installer.bin)

+ 下载cloudera manager5.0.1所需的rpm包
[http://archive.cloudera.com/cm5/redhat/6/x86_64/cm/5.0.1/RPMS/x86_64/](http://archive.cloudera.com/cm5/redhat/6/x86_64/cm/5.0.1/RPMS/x86_64/) 下所有文件保存

+ 下载cloudera manager5.0.1所需的Parcel文件
[http://archive.cloudera.com/cdh5/parcels/5.0.1/](http://archive.cloudera.com/cdh5/parcels/5.0.1/)

<br />在以上地址下载.parcel和.parcel.sha1和manifest.json文件

> 其中 <br />
> CentOS 6.X对应CDH-5.0.1-1.cdh5.0.1.p0.47-el6.parcel <br />
> CentOS 5.X对应CDH-5.0.1-1.cdh5.0.1.p0.47-el5.parcel <br />

+ 安装rpm文件

将下载的rpm包放入文件夹rpm（文件夹名随意）<br />
cd  ./rpm（进入rpm目录）<br />
安装rpm包<br />
{% highlight text %}
yum localinstall –-nogpgcheck  *.rpm
{% endhighlight %}

+ 搭建本地yum服务器

将所下载的所有rpm包放入`/var/www/html/cm5/redhat/6/x86_64/cm/5.0.1/RPMS/x86_64` <br />
在/var/www/html/cm5/redhat/6/x86_64/cm/5.0.1/ 目录下执行`createrepo . `命令，如果没有安装createrepo请自行[百度](http://www.baidu.com/)

+ 启动http服务

{% highlight text %}
service httpd start
{% endhighlight %}

+ 在浏览器输入http://10.1.5.120/cm5查看

![查看http服务启动状况](/images/blog/hadoop/02-cloudera-setup/09-check-apache-httpd-service.png)

+ 将/etc/yum.repos.d目录下所有文件删除

执行`touch cloudera-manager.repo`, 并将如下信息写入上述文件

{% highlight text %}
[cloudera-manager]
name=cloudera manager repository
baseurl=http://10.1.5.120/cm5/redhat/6/x86_64/cm/5.0.1/
enabled=1
gpgcheck=0
{% endhighlight %}

+ 安装rpm文件

赋执行权限： `chmod u+x cloudera-manager-installer.bin` <br />
执行 `./cloudera-manager-installer.bin`

+ 将会有一个图形划的界面，全部YES并且Next，其中产生的log会记录在/var/log/cloudera-manager-installer目录下

![查看http服务启动状况](/images/blog/hadoop/02-cloudera-setup/10-check-cloudera-manager-installer-log.png)

+ 将`.parcel`和`.parcel.sha1`和`manifest.json`文件拷贝到`/opt/cloudera/parcel-repo`文件夹下

![查看http服务启动状况](/images/blog/hadoop/02-cloudera-setup/11-copy-all-parcel-files.png)

+ 将.parcel.sha1文件重命名为.parcel.sha

![将.parcel.sha1文件重命名](/images/blog/hadoop/02-cloudera-setup/12-rename-parcel.sha-file.png)

第二部分：CDH安装
=================================

+ 打开`http://10.1.5.120:7180/`然后以默认的用户名和密码（admin:admin）登录，选定要使用的版本（本人使用的是完全免费版，第一个），Next

![选择版本](/images/blog/hadoop/02-cloudera-setup/13-choose-cdh-version.png)

+ 在接下来的搜索框中输入IP地址，并点击搜索，选中所选出的主机

![搜索可用IP](/images/blog/hadoop/02-cloudera-setup/14-search-machine-host.png)

+ 在下一页中选择我们下载的Parcel

![选中Parcel文件](/images/blog/hadoop/02-cloudera-setup/15-choose-parcels.png)

+ 在接下来配置SSH的用户名和密码，此处建议使用hadoop，为所有的集群用户添加hadoop用户，本人简化版，使用root用户

![配置用户名和密码](/images/blog/hadoop/02-cloudera-setup/16-config-username-password.png)

+ 接下来就看到正在安装的画面了

![安装进度1](/images/blog/hadoop/02-cloudera-setup/17-CDH-installing.png)

+ CHD正在分配到主机

![安装进度2](/images/blog/hadoop/02-cloudera-setup/18-CDH-installing.png)

+ 为服务Cloudera设置Metadata数据库(使用系统自带嵌入式PostgreSQL)

![设置Metadata数据库](/images/blog/hadoop/02-cloudera-setup/19-database-setup.png)

+ 系统展示最后的设置信息，如果想在安装过程修改，这是最后一次机会。

![设置信息](/images/blog/hadoop/02-cloudera-setup/20-review-all-configurations.png)

+ 所有安装完成：返回监控主页面

![监控主页面](/images/blog/hadoop/02-cloudera-setup/21-main-control-page.png)

<br />
<br />

参考资料
=======================

Cloudera Manager （centos）安装详细介绍 : [http://www.aboutyun.com/thread-9190-1-1.html](http://www.aboutyun.com/thread-9190-1-1.html)


Cloudera 官网文档 ：[http://www.cloudera.com/](http://www.cloudera.com/)
<br />
<br />