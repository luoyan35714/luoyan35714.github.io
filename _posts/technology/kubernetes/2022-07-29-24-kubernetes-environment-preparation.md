---
layout: post
title:  Kubernetes - 24 - 安装环境准备工作
date:   2022-07-29 20:40:00 +0800
categories: 技术文档
tag: Kubernetes
---

* content
{:toc}


### 1. 安装必须的工具
由于是最小安装，有些必须的工具还是需要安装的

```bash
$ yum update -y && yum install -y wget net-tools
```

### 2. 关闭防火墙
```bash
$ systemctl stop firewalld && systemctl disable firewalld
```

### 3. 关闭selinux
```bash
# 临时关闭
$ setenforce 0
# 永久关闭
$ sed -i 's/enforcing/disabled/' /etc/selinux/config

# 查看selinux状态, Permissive表示宽容模式，即已关闭, 或者Disabled关闭
$ getenforce
Permissive
```

### 4. 关闭swap
```bash
# 临时关闭
$ swapoff -a
# 永久关闭
$ vi /etc/fstab
# 删除 /dev/mapper/centos-swap swap swap defaults  0 0 这一行或者注释掉这一行

# 查看swap状态，都为0即已经关闭
$ free -m
total        used        free      shared  buff/cache   available
Mem:           1819         204        1271           9         343        1463
Swap:             0           0           0
```

### 5. 配置内核参数，将桥接的IPv4流量传递到iptables的链
```bash
# 安装了ipset ipvsadm软件包
$ yum install ipvsadm ipset -y
$ cat <<EOF >/etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
vm.swappiness=0
EOF

# 开启ipvs
$ cat <<EOF> /etc/sysconfig/modules/ipvs.modules
#!/bin/bash
modprobe -- ip_vs
modprobe -- ip_vs_rr
modprobe -- ip_vs_wrr
modprobe -- ip_vs_sh
modprobe -- nf_conntrack_ipv4
modprobe -- br_netfilter
EOF

# 加载模块
$ chmod 755 /etc/sysconfig/modules/ipvs.modules && bash /etc/sysconfig/modules/ipvs.modules && lsmod | grep -e ip_vs -e nf_conntrack_ipv4

# 应用配置文件
$ sysctl -p /etc/sysctl.d/k8s.conf
```

### 6. 设置主机名
```bash
# 分别登录六台机器设置主机名
$ hostnamectl set-hostname k8s-master1
$ hostnamectl set-hostname k8s-master2
$ hostnamectl set-hostname k8s-node1
```
### 7. 在每台VM的hosts文件中添加

```bash
$ cat >> /etc/hosts << EOF
172.16.140.250 k8s-master-vip
172.16.140.141 k8s-master1
172.16.140.142 k8s-master2
172.16.140.151 k8s-node1
EOF
```

### 8. 设置时间同步
```bash
# 设置正确的时区
$ timedatectl set-timezone Asia/Shanghai
# 将当前的 UTC 时间写入硬件时钟
$ timedatectl set-local-rtc 0
# 重启依赖于系统时间的服务
$ systemctl restart rsyslog
# 时间同步
$ yum install ntpdate -y
$ ntpdate time.windows.com
```

### 9. 升级机器内核
```bash
# 更新系统
$ yum update -y --exclude=kernel*
# 网速太慢可以从百度网盘下载
$ wget https://elrepo.org/linux/kernel/el7/x86_64/RPMS/kernel-lt-5.4.203-1.el7.elrepo.x86_64.rpm
$ wget https://elrepo.org/linux/kernel/el7/x86_64/RPMS/kernel-lt-devel-5.4.203-1.el7.elrepo.x86_64.rpm
# 安装系统内容
$ yum localinstall /root/kernel-lt* -y
# 调到默认启动
$ grub2-set-default  0 && grub2-mkconfig -o /etc/grub2.cfg
# 查看当前默认启动的内核 
$ grubby --default-kernel
$ reboot
```