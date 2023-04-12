---
layout: post
title:  Kubernetes - 22 - kubeadm安装高可用kubernetes
date:   2022-07-29 20:20:00 +0800
categories: 技术文档
tag: Kubernetes
---

* content
{:toc}


### 1. 安装架构

![image.png](/images/blog/kubernetes/22-kubernetes-kubeadm-installation/01-installation-architecture.png)

> 如果安装1.24版本需要注意事项
> Kubernetes 1.24新特性
> dockershim组件从1.20版本被弃用，并在1.24的kubelet中被删除。从1.24开始，大家需要使用其他受到支持的运行时选项（例如containerd或CRI-O）；如果您选择Docker Engine作为运行时，则需要使用cri-dockerd。

> 本次实验使用containerd

> 本次实验安装kubernetes版本为1.23

### 2. 安装要求

+ 六台服务器或VM，操作系统CentOS-7-x86_64-Minimal
+ 安装和网络设置，请按照上图`安装架构`的要求配置，具体可以参考文档`901-Vmware安装配置虚拟机`
+ 硬件要求如下

| 节点 | CPU | 内存 | 硬盘 |
| ---- | --- | ---- | ---- |
| master | 2核 | 2G | 20G |
| node | 2核 | 2G | 20G |

### 3. 安装和配置系统基础

参考 [Kubernetes - 24 - 安装环境准备工作](https://www.hifreud.com/2022/07/29/24-kubernetes-environment-preparation/) 文档


### 4. 安装keepalived

#### 4.1 所有master节点安装keepalived

```bash
$ yum install -y conntrack-tools libtool-ltdl libseccomp keepalived
```

#### 4.2 在k8s-master1配置为master节点

```bash
$ cat > /etc/keepalived/keepalived.conf <<EOF 
! Configuration File for keepalived

global_defs {
   router_id 172.16.140.141  #节点ip，master每个节点配置自己的IP
}

vrrp_script check_haproxy {
    script "killall -0 haproxy"
    interval 3
    weight -2
    fall 10
    rise 2
}

vrrp_instance VI_1 {
    state MASTER 
    interface ens33 
    virtual_router_id 51
    priority 250
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass ceb1b3ec013d66163d6ab
    }
    virtual_ipaddress {
        172.16.140.250
    }
    track_script {
        check_haproxy
    }

}
EOF
```

#### 4.3 在k8s-master2配置为backup节点

```bash
$ cat > /etc/keepalived/keepalived.conf <<EOF 
! Configuration File for keepalived

global_defs {
   router_id 172.16.140.142  #节点ip，master每个节点配置自己的IP
}

vrrp_script check_haproxy {
    script "killall -0 haproxy"
    interval 3
    weight -2
    fall 10
    rise 2
}

vrrp_instance VI_1 {
    state BACKUP 
    interface ens33 
    virtual_router_id 51
    priority 200
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass ceb1b3ec013d66163d6ab
    }
    virtual_ipaddress {
        172.16.140.250
    }
    track_script {
        check_haproxy
    }

}
EOF
```

#### 4.4 启动keepalived服务

分别在三台k8s-master服务器执行如下命令启动keepalived

```bash
# 启动keepalived
$ systemctl start keepalived.service
设置开机启动
$ systemctl enable keepalived.service
# 查看启动状态
$ systemctl status keepalived.service
```

启动后查看k8s-master1的网卡信息,发现多了VIP

```bash
$ ip a s ens33
```

### 5. 安装haproxy

#### 5.1 安装haproxy包

```bash
$ yum install -y haproxy
```

#### 5.2 配置
两台master节点的配置均相同，配置中声明了后端代理的三个k8s-master节点服务器，指定了haproxy运行的端口为16443等，因此16443端口为集群的入口

```bash
$ cat > /etc/haproxy/haproxy.cfg << EOF
#---------------------------------------------------------------------
# Global settings
#---------------------------------------------------------------------
global
    # to have these messages end up in /var/log/haproxy.log you will
    # need to:
    # 1) configure syslog to accept network log events.  This is done
    #    by adding the '-r' option to the SYSLOGD_OPTIONS in
    #    /etc/sysconfig/syslog
    # 2) configure local2 events to go to the /var/log/haproxy.log
    #   file. A line like the following can be added to
    #   /etc/sysconfig/syslog
    #
    #    local2.*                       /var/log/haproxy.log
    #
    log         127.0.0.1 local2
    
    chroot      /var/lib/haproxy
    pidfile     /var/run/haproxy.pid
    maxconn     4000
    user        haproxy
    group       haproxy
    daemon 
       
    # turn on stats unix socket
    stats socket /var/lib/haproxy/stats
#---------------------------------------------------------------------
# common defaults that all the 'listen' and 'backend' sections will
# use if not designated in their block
#---------------------------------------------------------------------  
defaults
    mode                    http
    log                     global
    option                  httplog
    option                  dontlognull
    option http-server-close
    option forwardfor       except 127.0.0.0/8
    option                  redispatch
    retries                 3
    timeout http-request    10s
    timeout queue           1m
    timeout connect         10s
    timeout client          1m
    timeout server          1m
    timeout http-keep-alive 10s
    timeout check           10s
    maxconn                 3000
#---------------------------------------------------------------------
# kubernetes apiserver frontend which proxys to the backends
#--------------------------------------------------------------------- 
frontend kubernetes-apiserver
    mode                 tcp
    bind                 *:16443
    option               tcplog
    default_backend      kubernetes-apiserver    
#---------------------------------------------------------------------
# round robin balancing between the various backends
#---------------------------------------------------------------------
backend kubernetes-apiserver
    mode        tcp
    balance     roundrobin
    server      k8s-master1   172.16.140.141:6443 check
    server      k8s-master2   172.16.140.142:6443 check
#---------------------------------------------------------------------
# collection haproxy statistics message
#---------------------------------------------------------------------
listen stats
    bind                 *:1080
    stats auth           admin:awesomePassword
    stats refresh        5s
    stats realm          HAProxy\ Statistics
    stats uri            /admin?stats
EOF
```

#### 5.3 启动haproxy服务

```
# 设置开机启动
$ systemctl enable haproxy
# 开启haproxy
$ systemctl start haproxy
# 查看启动状态
$ systemctl status haproxy
# 检查端口
$ netstat -lntup|grep haproxy
```

### 6. 安装containerd
在五台服务器分别执行如下操作

#### 6.1 卸载docker

```bash
$ sudo yum remove -y docker \
      docker-client \
      docker-client-latest \
      docker-common \
      docker-latest \
      docker-latest-logrotate \
      docker-logrotate \
      docker-engine
```

#### 6.2 下载，安装和配置containerd
> containerd要求最低版本v1.6.4或更高

```bash
$ curl -s -L http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo > /etc/yum.repos.d/docker-ce.repo
$ yum install containerd -y
#创建配置文件目录
$ mkdir /etc/containerd -p
#生成默认配置文件
$ containerd config default > /etc/containerd/config.toml
# 替换pause为最新版本
$ sed -i 's#sandbox_image = "k8s.gcr.io/pause:3.6"#sandbox_image = "registry.aliyuncs.com/google_containers/pause:3.6"#' /etc/containerd/config.toml
# 配置systemd作为容器的cgroup driver
$ sed -i 's/SystemdCgroup \= false/SystemdCgroup \= true/' /etc/containerd/config.toml
```

#### 6.3 启动containerd

```bash
$ systemctl enable containerd --now
# 查看containerd启动状态
$ systemctl status containerd
# 查看ctr版本号
$ ctr version
# 查看containerd版本号
$ containerd --version
```

### 7. 安装kubeadm, kubelet，kubectl

在六台服务器上都分别安装kubeadm，kubelet和kubectl

```bash
# 添加国内yum源
$ cat > /etc/yum.repos.d/kubernetes.repo << EOF
[kubernetes]
name=Kubernetes
baseurl=https://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=0
repo_gpgcheck=0
gpgkey=https://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg https://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF
# 安装kubelet, kubeadm, kubectl
$ yum install -y kubelet-1.23.8-0 kubectl-1.23.8-0 kubeadm-1.23.8-0
$ cat <<EOF> /etc/sysconfig/kubelet
KUBELET_KUBEADM_ARGS="--container-runtime=remote --runtime-request-timeout=15m --container-runtime-endpoint=unix:///run/containerd/containerd.sock"
EOF
$ systemctl enable kubelet
```

### 8. 部署kubernetes Master和Node

#### 8.1 创建kubeadm配置文件
在具有vip的k8s-master上操作，这里为k8s-master1

```bash
$ kubeadm config print init-defaults > kubeadm.yaml
# 修改配置文件为如下信息
$ cat <<EOF> kubeadm.yaml 
---
kind: InitConfiguration
apiVersion: kubeadm.k8s.io/v1beta3
bootstrapTokens:
- groups:
  - system:bootstrappers:kubeadm:default-node-token
  token: abcdef.0123456789abcdef
  ttl: 24h0m0s
  usages:
  - signing
  - authentication
localAPIEndpoint:
  advertiseAddress: 172.16.140.141 # apiserver 节点内网IP
  bindPort: 6443
nodeRegistration:
  criSocket: unix:///run/containerd/containerd.sock  # 修改为containerd
  imagePullPolicy: IfNotPresent
  name: k8s-master1
  taints:
  - effect: NoSchedule
    key: node-role.kubernetes.io/master
---
apiServer:
  timeoutForControlPlane: 4m0s
apiVersion: kubeadm.k8s.io/v1beta3
certificatesDir: /etc/kubernetes/pki
clusterName: kubernetes
controllerManager: {}
dns: {}
etcd:
  local:
    dataDir: /var/lib/etcd
imageRepository: registry.aliyuncs.com/google_containers # 修改这个镜像能下载
kind: ClusterConfiguration
kubernetesVersion: 1.23.8 # k8s版本
controlPlaneEndpoint: 172.16.140.250:16443        #高可用地址，我这里填写vip
networking:
  dnsDomain: cluster.local
  podSubnet: 10.244.0.0/16  
  serviceSubnet: 10.96.0.0/12
scheduler: {}
---
apiVersion: kubeproxy.config.k8s.io/v1alpha1
kind: KubeProxyConfiguration
mode: ipvs  # kube-proxy 模式
EOF
```

#### 8.2 验证kubeadm-init文件是否有错误

```bash
$ kubeadm init --config kubeadm.yaml --dry-run
```

#### 8.3 预先拉取镜像

```bash
$ kubeadm config images list --config kubeadm.yaml
registry.aliyuncs.com/google_containers/kube-apiserver:v1.23.5
registry.aliyuncs.com/google_containers/kube-controller-manager:v1.23.5
registry.aliyuncs.com/google_containers/kube-scheduler:v1.23.5
registry.aliyuncs.com/google_containers/kube-proxy:v1.23.5
registry.aliyuncs.com/google_containers/pause:3.6
registry.aliyuncs.com/google_containers/etcd:3.5.1-0
registry.aliyuncs.com/google_containers/coredns:v1.8.6
# 预先下载所有镜像
$ ctr images pull registry.aliyuncs.com/google_containers/kube-apiserver:v1.23.8
$ ctr images pull registry.aliyuncs.com/google_containers/kube-controller-manager:v1.23.8
$ ctr images pull registry.aliyuncs.com/google_containers/kube-scheduler:v1.23.8
$ ctr images pull registry.aliyuncs.com/google_containers/kube-proxy:v1.23.8
$ ctr images pull registry.aliyuncs.com/google_containers/pause:3.6
$ ctr images pull registry.aliyuncs.com/google_containers/etcd:3.5.1-0
$ ctr images pull registry.aliyuncs.com/google_containers/coredns:v1.8.6

# 检查镜像导入状况
$ ctr i ls -q
registry.aliyuncs.com/google_containers/coredns:v1.8.6
registry.aliyuncs.com/google_containers/etcd:3.5.1-0
registry.aliyuncs.com/google_containers/kube-apiserver:v1.23.8
registry.aliyuncs.com/google_containers/kube-controller-manager:v1.23.8
registry.aliyuncs.com/google_containers/kube-proxy:v1.23.8
registry.aliyuncs.com/google_containers/kube-scheduler:v1.23.8
registry.aliyuncs.com/google_containers/pause:3.6
```

#### 8.4 初始化k8s-master1节点

```bash
$ kubeadm init --config kubeadm.yaml --upload-certs
```

初始化完成之后会出现如下图所示输出
![image.png](/images/blog/kubernetes/22-kubernetes-kubeadm-installation/02-kube-init.png)

```bash
$ mkdir -p $HOME/.kube
$ sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
$ sudo chown $(id -u):$(id -g) $HOME/.kube/config
$ kubectl get node
NAME          STATUS     ROLES                  AGE   VERSION
k8s-master1   NotReady   control-plane,master   72s   v1.23.8

## 查看master初始化过程中的日志
$ journalctl -xeu kubelet

## 查看k8s基础container运行状态
$ crictl ps -a
```

#### 8.5 将k8s-master2节点作为control plane加入kubernetes集群

```bash
$ kubeadm join 172.16.140.141:6443 --token abcdef.0123456789abcdef \
	--discovery-token-ca-cert-hash **** \
	--control-plane --certificate-key ****
```

#### 8.6 初始化k8s-node1，k8s-node2，k8s-node3节点

```bash
$ kubeadm join 172.16.140.141:6443 --token abcdef.0123456789abcdef \
	--discovery-token-ca-cert-hash ******
```

### 9. 安装calico

#### 9.1 手动导入calico的image

由于calico所需的image下载较慢，此处可以通过手动导入的方式

```
$ ctr image import calico-cni-v3.23.2.rar
$ ctr image import calico-node-v3.23.2.rar
$ ctr image import calico-kube-controllers-v3.23.2.rar

$ ctr i ls -q
```

#### 9.2 安装

```bash
$ curl -s -L https://docs.projectcalico.org/manifests/calico.yaml > calico.yaml
# 修改calico.yaml中的文件，其中value为kubeadm.yaml中的networking.podSubnet
# - name: CALICO_IPV4POOL_CIDR
#   value: "10.244.0.0/16"
$ kubectl apply -f calico.yaml
```

#### 9.3 查看kubernetes Node的状态

```bash
$ kubectl get node
NAME          STATUS   ROLES                  AGE   VERSION
k8s-master1   Ready    control-plane,master   30m   v1.23.8
k8s-master2   Ready    control-plane,master   30m   v1.23.8
k8s-node1     Ready    <none>                 30m   v1.23.8
$ kubectl label node k8s-node1 node-role.kubernetes.io/worker=worker
node/k8s-node1 labeled
$ kubectl get node                                                  
NAME          STATUS   ROLES                  AGE   VERSION
k8s-master1   Ready    control-plane,master   32m   v1.23.8
k8s-master2   Ready    control-plane,master   31m   v1.23.8
k8s-node1     Ready    worker                 31m   v1.23.8
```