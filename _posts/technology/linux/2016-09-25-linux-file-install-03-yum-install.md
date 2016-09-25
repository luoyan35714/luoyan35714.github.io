---
layout: post
title:  Linux环境下的文件安装之(三) - YUM在线安装
date:   2016-09-25 08:42:00 +0800
categories: 技术文档
tag: Linux
---

* content
{:toc}


Yum源文件
==============================

文件目录
------------------------------

`/etc/yum.repos.d`

默认文件
------------------------------

| CentOS-Base.repo      |
| CentOS-Debuginfo.repo | 
| CentOS-Media.repo     |
| CentOS-Vault.repo     |

CentOS-Base.repo
------------------------------

{% highlight bash %}
[base]
name=CentOS-$releaserver - Base
mirrorlist=http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=os
#baseurl=http://mirror.centos.org/centos/$releasevver/os/$basearch/
gpgcheck=1
gpgkey=file:///etc/pki/rpm=gpg/RPM-GPG-KEY=CentOS-6
#上述中file后面`://`双斜杠代表的是协议的意思，即file协议
{% endhighlight %}

vi /etc/yum.repos.d/CentOS-Base.repo
------------------------------

| [base]     | 容器名称，一定要放在[]中 |
| name       | 容器说明，可以自己随便写 |
| mirrorlist | 镜像站点，这个可以注释掉 |
| baseurl    | 我们的YUM源服务器的地址，默认是CentOS官方的yum源服务器，是可以使用的，如果你觉得慢可以改成你喜欢的yum源地址 |
| enabled    | 此容器是否生效，如果不写或写成enable=1都是生效，写成enable=0就是不生效 |
| gpgcheck   | 如果是1是指RPM的数字证书生效，如果是0则不生效 |
| gpgkey     | 数字证书的公钥文件保存位置，不用修改 |


光盘搭建yum源
==============================

挂载光盘
------------------------------

{% highlight bash %}
#建立挂载点
mkdir /mnt/cdrom
#挂载光盘
mount /dev/cdrom mnt/cdrom
{% endhighlight %}

使网络Yum源失效
------------------------------

{% highlight bash %}
#进入yum源目录
cd /etc/yum.repos.d/
#修改yum源文件后缀名，使其失效
mv CentOS-Base.repo CentOS-Base.repo.bak
{% endhighlight %}

使光盘Yum源生效
------------------------------

`vim CentOS-Media.repo`

{% highlight bash %}
[c6-media]
name=CentOS-$releasever - Media
basrurl=file://mnt/cdrom  # 地址为你自己的光盘挂载地址
#		file:///media/cdrom
#		file:///media/cdrecorder # 注释这两个不存在的地址
gpgcheck=1
enabled=1  # 把enabled=0改为enabled=1，让这个yum源配置文件生效
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-6
{% endhighlight %}


Yum命令
==============================

{% highlight bash %}
# 查询所有软件包列表
[root@localhost ~]# yum list

# 搜索服务器上所有和关键字相关的包
[root@localhost ~]# yum search 关键字

# 安装命令
[root@localhost ~]# yum -y install 包名
 - 选项：
 > install 	安装
 > -y 		自动回答yes
[root@localhost ~]# yum -y install gcc 	# C语言编译器

# 升级命令
[root@localhost ~]# yum -y update 包名
 - 选项：
 > update 	升级
 > -y 		自动回答yes

# 升级本服务器下所有的安装包，并且更新linux新内核，慎用，CentOS6.3及以前会有问题
[root@localhost ~]# yum -y update

# 卸载
[root@localhost ~]# yum -y remove 包名
 - 选项：
 - remove	卸载
 - -y 		自动回答yes
# 服务器使用最小化安装，用什么软件安装什么，尽量不卸载

# 列出所有可用的软件组列表
[root@localhost ~]# yum grouplist

# 安装指定软件组，组名可以由grouplist查询出来
[root@localhost ~]# yum groupinstall 软件组名
# 注意：软件组名必须是英文
LANG=en_US # 修改语言，让显示的grouplist是英文列表

# 卸载指定软件组
[root@localhost ~]# yum groupremove 软件组名
{% endhighlight %}


<br />
<br />

参考资料：
===========================

慕课网-Linux软件安装管理：[http://www.imooc.com/learn/447](http://www.imooc.com/learn/447)

鸟哥的Linux私房菜: [http://linux.vbird.org/linux_server/0440ntp.php](http://linux.vbird.org/linux_server/0440ntp.php)

<br />
<br />