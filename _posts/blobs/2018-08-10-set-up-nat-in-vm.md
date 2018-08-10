---
layout:       post
title:        在VMWare中的Centos 7设置NAT静态IP模式
date:         2018-08-10 10:48:00 +0800
categories:   杂乱
tag:          VMWare
---

* content
{:toc}


Hostonly, NAT和Bridge区别
======================

vmware提供三种方式让主机与虚拟机进行通信，Hostonly，Nat，Bridge。

1，hostonly宿主机能访问虚拟机，虚拟机无法访问宿主机外部网络；

2，bridge需要和宿主机保持在同一网络，一般都是通过dhcp自动获取网络ip来上网的，所以难以保证虚拟机固定的ip与此网段的ip不冲突，冲突后还需要修改虚拟机ip，这个很繁琐

3，nat，可以和宿主机保持不在同一网段，虚拟机可以通过宿主机访问外部网通，原理是通过在宿主机安装的vm8网卡作为代理访问外部网络，而且还可以通过端口映射的方式实现宿主机外部网络访问虚拟机。NAT在进行网络连接的时候，会将宿主机当做一个路由器使用，这样做的好处是可以将私有ip地址转换为公有ip地址（宿主地址），将请求发出去，可以节约ip地址不足的问题；


在VMware中设置NAT模式
======================

+ 打开 `VMWare` -> `Edit` -> `Virtual Network Editor`, 并点击下图红色标记处的`Change Settings`, 此操作需要Admin权限

![/images/blog/blobs/vmware-nat/01-virtual-network-editor.png](/images/blog/blobs/vmware-nat/01-virtual-network-editor.png)

+ 在弹出的窗口中选择VMnet8 并确定设置如下

其中我们diable了DHCP，这个是动态分配IP地址给虚拟机的，每次虚拟机重启会修改IP，所以比较烦人，不建议使用。

![/images/blog/blobs/vmware-nat/02-disable-dhcp.png](/images/blog/blobs/vmware-nat/02-disable-dhcp.png)

+ 点击 `NAT Settings...`，在弹出的窗口中做如下配置

![/images/blog/blobs/vmware-nat/01-virtual-network-editor.png](/images/blog/blobs/vmware-nat/03-gateway.png)


在虚拟机内部修改配置
======================

修改 `/etc/sysconfig/network-scripts/ifcfg-ens33`
----------------------

设置`BOOTPROTO`, `IPADDR`, `NETMASK`, `GATEWAY`

其中GATEWAY一定记得设置，要不然会出现宿主机无法访问虚拟机的问题。

{% highlight bash %}
$ vi /etc/sysconfig/network-scripts/ifcfg-ens33
TYPE=Ethernet
PROXY_METHOD=none
BROWSER_ONLY=no
BOOTPROTO=static
IPADDR=192.168.75.141
NETMASK=255.255.255.0
GATEWAY=192.168.75.2
DEFROUTE=yes
IPV4_FAILURE_FATAL=no
IPV6INIT=yes
IPV6_AUTOCONF=yes
IPV6_DEFROUTE=yes
IPV6_FAILURE_FATAL=no
IPV6_ADDR_GEN_MODE=stable-privacy
NAME=ens33
DEVICE=ens33
ONBOOT=yes
{% endhighlight %}

修改 `/etc/sysconfig/network`
----------------------

{% highlight bash %}
$ vi /etc/sysconfig/network
# Created by anaconda
NETWORKING=yes
HOSTNAME=WebServer
GATEWAY=192.168.75.2
{% endhighlight %}

修改 `/etc/resolv.conf `
----------------------

{% highlight bash %}
vi /etc/resolv.conf
search localdomain
nameserver 192.168.75.2
{% endhighlight %}


参考资料 
======================

VMware虚拟机设置centos固定ip地址 : [https://blog.csdn.net/readiay/article/details/45338709](https://blog.csdn.net/readiay/article/details/45338709)

针对VMware虚拟机NAT无法使用解决方案——桥接的力量！: [https://www.cnblogs.com/master-miss/p/7582272.html](https://www.cnblogs.com/master-miss/p/7582272.html)

vmware配置nat与虚拟机进行互访: [https://blog.csdn.net/love906090685/article/details/70236600](https://blog.csdn.net/love906090685/article/details/70236600)