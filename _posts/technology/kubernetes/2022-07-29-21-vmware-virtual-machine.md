---
layout: post
title:  Kubernetes - 21 - Vmware安装配置虚拟机
date:   2022-07-29 20:10:00 +0800
categories: 技术文档
tag: Kubernetes
---

* content
{:toc}


# 1. 安装Vmware Fusion
安装过程略

# 2. 安装CentOS 7 86_x64

镜像下载地址：[http://mirrors.aliyun.com/centos/7.9.2009/isos/x86_64/](http://mirrors.aliyun.com/centos/7.9.2009/isos/x86_64/)
镜像名字：CentOS-7-x86_64-DVD-2009.iso

安装过程略，要求如下

| CPU   | Memory | Disk |
| ----- | ------ | ---- |
| 2Core | 2GB--- | 30GB |

# 3. 配置虚拟机固定IP
> 以下过程为MacOS配置，Windows配置请参考文档 [https://www.hifreud.com/2018/08/10/set-up-nat-in-vm/](https://www.hifreud.com/2018/08/10/set-up-nat-in-vm/)

## 3.1 查看Vmware Fusion的NAT Gateway和NETMASK

```bash
$ cat /Library/Preferences/VMware\ Fusion/vmnet8/nat.conf
```

如下图，Gateway IP为`172.16.140.1`  netmask为`255.255.255.0`
![image.png](/images/blog/kubernetes/21-vmware-virtual-machine/01-nat.png)

## 3.2 查看DHCP获取可分配网段的地址全集

```bash
$ cat /Library/Preferences/VMware\ Fusion/vmnet8/dhcpd.conf
```

如下图，所有的NAT网络模式虚拟机只能分配在`172.16.140.128` ~ `172.16.140.254`之间

![image.png](/images/blog/kubernetes/21-vmware-virtual-machine/02-dhcpd.png)

## 3.3 获取DNS地址

在Mac的`System Preferences...`->`Network` 中找到`Wi-Fi`，点击`Advanced...`

![image.png](/images/blog/kubernetes/21-vmware-virtual-machine/03-dns.png)

点击`DNS`获取本地DNS地址, 如下图为`192.168.3.1`

![image.png](/images/blog/kubernetes/21-vmware-virtual-machine/04-add-dns.png)

## 3.4 为虚拟机配置固定IP

```bash
vi /etc/sysconfig/network-scripts/ifcfg-ens33
# 确保 BOOTPROTO=static
# 确保 ONBOOT=yes
# 确保 GATEWAY, NETMASK, DNS1为上面我们获取的内容
# DNS2是一个公网的DNS地址
# IPADDR是我们要给VM配置的固定IP
```
具体如下图

![image.png](/images/blog/kubernetes/21-vmware-virtual-machine/05-ifcfg-ens33.png)

## 3.5 重启网络服务并验证

```bash
$ systemctl restart network.service
$ ifconfig | grep 172.16.140
inet 172.16.140.141  netmask 255.255.255.0  broadcast 172.16.140.255
$ ping www.baidu.com
```