---
layout: post
title:  Kubernetes-01-kubernetes安装
date:   2018-08-10 10:00:00 +0800
categories: 技术文档
tag: Kubernetes
---

* content
{:toc}


在 CentOS 上使用 kubeadm 安装 kubernetes 1.8.4
=================================

本文转载自[http://batizhao.github.io/2017/12/15/install-kubernetes-1-8-4-use-kubeadm/](http://batizhao.github.io/2017/12/15/install-kubernetes-1-8-4-use-kubeadm/)

准备工作
=================================

在所有主机执行以下工作。

修改主机名称
---------------------------------

{% highlight bash %}
$ hostnamectl --static set-hostname k8s-master
$ hostnamectl --static set-hostname k8s-node-2
$ hostnamectl --static set-hostname k8s-node-3
{% endhighlight %}

配 hosts
---------------------------------

{% highlight bash %}
$ echo "192.168.75.139  k8s-master
192.168.75.140  k8s-node-2
192.168.75.142  k8s-node-3" >> /etc/hosts
{% endhighlight %}

关防火墙和 selinux
---------------------------------

{% highlight bash %}
$ systemctl stop firewalld && systemctl disable firewalld
$ iptables -P FORWARD ACCEPT
$ sed -i 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config

$ echo "net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
vm.swappiness=0" >> /etc/sysctl.d/k8s.conf
$ sysctl -p /etc/sysctl.d/k8s.conf
{% endhighlight %}

关闭 swap
---------------------------------

{% highlight bash %}
$ swapoff -a
{% endhighlight %}

永久关闭，注释 swap 相关内容

{% highlight bash %}
vi /etc/fstab
#/dev/mapper/centos-swap swap                    swap    defaults        0 0
{% endhighlight %}

下载离线安装包
---------------------------------

在所有机器上执行

{% highlight bash %}
mkdir /apps/k8s/ -p
cd /apps/k8s/
{% endhighlight %}

在其中一台机器192.168.75.139上执行

{% highlight bash %}
wget https://packages.cloud.google.com/yum/pool/aeaad1e283c54876b759a089f152228d7cd4c049f271125c23623995b8e76f96-kubeadm-1.8.4-0.x86_64.rpm
wget https://packages.cloud.google.com/yum/pool/a9db28728641ddbf7f025b8b496804d82a396d0ccb178fffd124623fb2f999ea-kubectl-1.8.4-0.x86_64.rpm
wget https://packages.cloud.google.com/yum/pool/1acca81eb5cf99453f30466876ff03146112b7f12c625cb48f12508684e02665-kubelet-1.8.4-0.x86_64.rpm
wget https://packages.cloud.google.com/yum/pool/79f9ba89dbe7000e7dfeda9b119f711bb626fe2c2d56abeb35141142cda00342-kubernetes-cni-0.5.1-1.x86_64.rpm
{% endhighlight %}

在其他机器执行

{% highlight bash %}
scp root@192.168.75.139:/apps/k8s/aeaad1e283c54876b759a089f152228d7cd4c049f271125c23623995b8e76f96-kubeadm-1.8.4-0.x86_64.rpm /apps/k8s
scp root@192.168.75.139:/apps/k8s/a9db28728641ddbf7f025b8b496804d82a396d0ccb178fffd124623fb2f999ea-kubectl-1.8.4-0.x86_64.rpm /apps/k8s
scp root@192.168.75.139:/apps/k8s/1acca81eb5cf99453f30466876ff03146112b7f12c625cb48f12508684e02665-kubelet-1.8.4-0.x86_64.rpm /apps/k8s
scp root@192.168.75.139:/apps/k8s/79f9ba89dbe7000e7dfeda9b119f711bb626fe2c2d56abeb35141142cda00342-kubernetes-cni-0.5.1-1.x86_64.rpm /apps/k8s
{% endhighlight %}


安装 docker
=================================

在所有主机执行以下工作。

> kubernetes 1.8.4 目前支持 Docker 17.03。

添加阿里源
---------------------------------

{% highlight bash %}
$ yum-config-manager --add-repo <http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo>
{% endhighlight %}

安装指定 Docker 版本
---------------------------------

{% highlight bash %}
$ sudo yum remove docker \
      docker-client \
      docker-client-latest \
      docker-common \
      docker-latest \
      docker-latest-logrotate \
      docker-logrotate \
      docker-selinux \
      docker-engine-selinux \
      docker-engine
$ sudo yum install -y yum-utils \
  device-mapper-persistent-data \
  lvm2
$ sudo yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo
$ yum install -y docker-ce
$ yum install -y --setopt=obsoletes=0 \
  docker-ce-17.03.2.ce-1.el7.centos \
  docker-ce-selinux-17.03.2.ce-1.el7.centos
{% endhighlight %}

配置 Docker 加速器(可做可不做)
---------------------------------

{% highlight bash %}
$ sudo mkdir -p /etc/docker
$ sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://xxx.mirror.aliyuncs.com"]
}
EOF
$ sudo systemctl daemon-reload && systemctl enable docker && systemctl restart docker && systemctl status docker
{% endhighlight %}

安装 k8s
=================================

在所有主机执行以下工作。

启动 kubelet
---------------------------------

{% highlight bash %}
$ yum -y localinstall *.rpm
$ yum install -y socat
$ sed -i 's/cgroup-driver=systemd/cgroup-driver=cgroupfs/g' /etc/systemd/system/kubelet.service.d/10-kubeadm.conf
$ systemctl daemon-reload && systemctl restart kubelet && systemctl enable kubelet && systemctl status kubelet
{% endhighlight %}

这时 kubelet 应该还在报错，不用管它。

{% highlight bash %}
$ journalctl -u kubelet --no-pager
{% endhighlight %}

准备 Docker 镜像
---------------------------------

{% highlight bash %}
docker pull gcr.io/google_containers/kube-apiserver-amd64  v1.8.4
docker pull gcr.io/google_containers/kube-controller-manager-amd64  v1.8.4
docker pull gcr.io/google_containers/kube-proxy-amd64  v1.8.4
docker pull gcr.io/google_containers/kube-scheduler-amd64  v1.8.4
docker pull quay.io/coreos/flannel    v0.9.1-amd64
docker pull gcr.io/google_containers/k8s-dns-sidecar-amd64  1.14.5
docker pull gcr.io/google_containers/k8s-dns-kube-dns-amd64  1.14.5
docker pull gcr.io/google_containers/k8s-dns-dnsmasq-nanny-amd64  1.14.5
docker pull gcr.io/google_containers/etcd-amd64  3.0.17
docker pull gcr.io/google_containers/pause-amd64  3.0
{% endhighlight %}

可以使用如下脚本拉取到本地。

{% highlight bash %}
$ vi pull_k8s_img.sh
#!/bin/bash
set -o errexit
set -o nounset
set -o pipefail

KUBE_VERSION=v1.8.4
KUBE_PAUSE_VERSION=3.0
ETCD_VERSION=3.0.17
DNS_VERSION=1.14.5
FLANNEL=v0.9.1-amd64

GCR_URL=gcr.io/google_containers
ALIYUN_URL=registry.cn-hangzhou.aliyuncs.com/batizhao

images=(kube-proxy-amd64:${KUBE_VERSION}
kube-scheduler-amd64:${KUBE_VERSION}
kube-controller-manager-amd64:${KUBE_VERSION}
kube-apiserver-amd64:${KUBE_VERSION}
pause-amd64:${KUBE_PAUSE_VERSION}
etcd-amd64:${ETCD_VERSION}
k8s-dns-sidecar-amd64:${DNS_VERSION}
k8s-dns-kube-dns-amd64:${DNS_VERSION}
k8s-dns-dnsmasq-nanny-amd64:${DNS_VERSION})


for imageName in ${images[@]} ; do
  docker pull $ALIYUN_URL/$imageName
  docker tag $ALIYUN_URL/$imageName $GCR_URL/$imageName
  docker rmi $ALIYUN_URL/$imageName
done

docker pull $ALIYUN_URL/flannel:v0.9.1-amd64
docker tag $ALIYUN_URL/flannel:v0.9.1-amd64 quay.io/coreos/flannel:v0.9.1-amd64
docker rmi $ALIYUN_URL/flannel:v0.9.1-amd64
$ chmod +x pull_k8s_img.sh
$ ./pull_k8s_img.sh
{% endhighlight %}

配置 k8s 集群
=================================

master 初始化
---------------------------------

在master节点执行如下：

{% highlight bash %}
#--apiserver-advertise-address={masterIP}
kubeadm init --apiserver-advertise-address=192.168.75.139 --kubernetes-version=v1.8.4 --pod-network-cidr=10.244.0.0/16
[kubeadm] WARNING: kubeadm is in beta, please do not use it for production clusters.
[init] Using Kubernetes version: v1.8.4
[init] Using Authorization modes: [Node RBAC]
[preflight] Running pre-flight checks
[preflight] WARNING: docker version is greater than the most recently validated version. Docker version: 18.06.0-ce. Max validated version: 17.03
[preflight] WARNING: docker service is not enabled, please run 'systemctl enable docker.service'
[kubeadm] WARNING: starting in 1.8, tokens expire after 24 hours by default (if you require a non-expiring token use --token-ttl 0)
[certificates] Generated ca certificate and key.
[certificates] Generated apiserver certificate and key.
[certificates] apiserver serving cert is signed for DNS names [k8s-master kubernetes kubernetes.default kubernetes.default.svc kubernetes.default.svc.cluster.local] and IPs [10.96.0.1 192.168.75.139]
[certificates] Generated apiserver-kubelet-client certificate and key.
[certificates] Generated sa key and public key.
[certificates] Generated front-proxy-ca certificate and key.
[certificates] Generated front-proxy-client certificate and key.
[certificates] Valid certificates and keys now exist in "/etc/kubernetes/pki"
[kubeconfig] Wrote KubeConfig file to disk: "admin.conf"
[kubeconfig] Wrote KubeConfig file to disk: "kubelet.conf"
[kubeconfig] Wrote KubeConfig file to disk: "controller-manager.conf"
[kubeconfig] Wrote KubeConfig file to disk: "scheduler.conf"
[controlplane] Wrote Static Pod manifest for component kube-apiserver to "/etc/kubernetes/manifests/kube-apiserver.yaml"
[controlplane] Wrote Static Pod manifest for component kube-controller-manager to "/etc/kubernetes/manifests/kube-controller-manager.yaml"
[controlplane] Wrote Static Pod manifest for component kube-scheduler to "/etc/kubernetes/manifests/kube-scheduler.yaml"
[etcd] Wrote Static Pod manifest for a local etcd instance to "/etc/kubernetes/manifests/etcd.yaml"
[init] Waiting for the kubelet to boot up the control plane as Static Pods from directory "/etc/kubernetes/manifests"
[init] This often takes around a minute; or longer if the control plane images have to be pulled.
[apiclient] All control plane components are healthy after 24.005622 seconds
[uploadconfig] Storing the configuration used in ConfigMap "kubeadm-config" in the "kube-system" Namespace
[markmaster] Will mark node k8s-master as master by adding a label and a taint
[markmaster] Master k8s-master tainted and labelled with key/value: node-role.kubernetes.io/master=""
[bootstraptoken] Using token: 2d2a69.f25a309035b5c3a1
[bootstraptoken] Configured RBAC rules to allow Node Bootstrap tokens to post CSRs in order for nodes to get long term certificate credentials
[bootstraptoken] Configured RBAC rules to allow the csrapprover controller automatically approve CSRs from a Node Bootstrap Token
[bootstraptoken] Configured RBAC rules to allow certificate rotation for all node client certificates in the cluster
[bootstraptoken] Creating the "cluster-info" ConfigMap in the "kube-public" namespace
[addons] Applied essential addon: kube-dns
[addons] Applied essential addon: kube-proxy

Your Kubernetes master has initialized successfully!

To start using your cluster, you need to run (as a regular user):

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
  http://kubernetes.io/docs/admin/addons/

You can now join any number of machines by running the following on each node
as root:

  kubeadm join --token 2d2a69.f25a309035b5c3a1 192.168.75.139:6443 --discovery-token-ca-cert-hash sha256:d6344a3881c51b73ad400747efba7e101a304a73c83d56ed3c500591fa028ad0
{% endhighlight %}

配置用户使用 kubectl 访问集群

{% highlight bash %}
$ mkdir -p $HOME/.kube && \
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config && \
  sudo chown $(id -u):$(id -g) $HOME/.kube/config
{% endhighlight %}

查看一下集群状态

{% highlight bash %}
$ kubectl get pod --all-namespaces -o wide
NAMESPACE     NAME                                 READY     STATUS    RESTARTS   AGE       IP               NODE
kube-system   etcd-k8s-master                      1/1       Running   0          2m        192.168.75.139   k8s-master
kube-system   kube-apiserver-k8s-master            1/1       Running   0          2m        192.168.75.139   k8s-master
kube-system   kube-controller-manager-k8s-master   1/1       Running   0          2m        192.168.75.139   k8s-master
kube-system   kube-dns-545bc4bfd4-zd8ph            0/3       Pending   0          3m        <none>           <none>
kube-system   kube-proxy-t9tfn                     1/1       Running   0          3m        192.168.75.139   k8s-master
kube-system   kube-scheduler-k8s-master            1/1       Running   0          2m        192.168.75.139   k8s-master

$ kubectl get cs
NAME                 STATUS    MESSAGE              ERROR
scheduler            Healthy   ok                   
controller-manager   Healthy   ok                   
etcd-0               Healthy   {"health": "true"}   
{% endhighlight %}

安装Pod Network

{% highlight bash %}
$ kubectl apply -f https://raw.githubusercontent.com/batizhao/dockerfile/master/k8s/flannel/kube-flannel.yml
{% endhighlight %}

这时再执行 kubectl get pod –all-namespaces -o wide 应该可以看到 kube-dns-545bc4bfd4-84pjx 已经变成 Running。如果遇到问题可能使用以下命令查看：

{% highlight bash %}
$ kubectl -n kube-system describe pod kube-dns-545bc4bfd4-84pjx
$ journalctl -u kubelet --no-pager
$ journalctl -u docker --no-pager
{% endhighlight %}

node 加入集群
---------------------------------

在 node 节点分别执行

{% highlight bash %}
#此命令是之前执行kubeadmin之后的最后一行输出，此命令保存好，如果丢失以后想再加入集群比较麻烦。
$ kubeadm join --token 2d2a69.f25a309035b5c3a1 192.168.75.139:6443 --discovery-token-ca-cert-hash sha256:d6344a3881c51b73ad400747efba7e101a304a73c83d56ed3c500591fa028ad0
{% endhighlight %}

此处需要注意的是生成的token是有过期时间的，默认24小时。而过24小时候还想要有节点加入到集群，可以在Master节点上执行`kubeadm token create`来生成新的token，如果想生成一个永不过期的token，则可以使用`kubeadm token create --ttl 0`

{% highlight bash %}
$ kubeadm token create
[kubeadm] WARNING: starting in 1.8, tokens expire after 24 hours by default (if you require a non-expiring token use --ttl 0)
962a35.92d554fb807afb3d
# 将之前命令中的token部分替换掉
$ kubeadm join --token 2d2a69.f25a309035b5c3a1 192.168.75.139:6443 --discovery-token-ca-cert-hash sha256:d6344a3881c51b73ad400747efba7e101a304a73c83d56ed3c500591fa028ad0
{% endhighlight %}


如果添加的过程中出错想回滚之前的kubeadm join，可以执行如下操作

{% highlight bash %}
# 在master节点上执行：
$ kubectl drain k8s-node-2 --delete-local-data --force --ignore-daemonsets
$ kubectl delete node k8s-node-2
# 在node2上执行：
$ kubeadm reset
{% endhighlight %}

在node-2机器上执行如上命令的时候报错如下

{% highlight bash %}
$ kubeadm join --token 2d2a69.f25a309035b5c3a1 192.168.75.139:6443 --discovery-token-ca-cert-hash sha256:d6344a3881c51b73ad400747efba7e101a304a73c83d56ed3c500591fa028ad0
[kubeadm] WARNING: kubeadm is in beta, please do not use it for production clusters.
[preflight] Running pre-flight checks
[preflight] WARNING: docker service is not enabled, please run 'systemctl enable docker.service'
[discovery] Trying to connect to API Server "192.168.75.139:6443"
[discovery] Created cluster-info discovery client, requesting info from "https://192.168.75.139:6443"
[discovery] Requesting info from "https://192.168.75.139:6443" again to validate TLS against the pinned public key
[discovery] Failed to request cluster info, will try again: [Get https://192.168.75.139:6443/api/v1/namespaces/kube-public/configmaps/cluster-info: x509: certificate has expired or is not yet valid]
{% endhighlight %}

查询得知原因为时间不同步导致，解决办法有两种，一个是暂时手动设置时间如下：

{% highlight bash %}
$ date -s "20180809 22:10:50"
{% endhighlight %}

另一种是[设置NTP时间同步服务器](https://www.hifreud.com/2015/11/12/time-sync-solution/)

如果需要从其它任意主机控制集群

{% highlight bash %}
$ mkdir -p $HOME/.kube
$ scp root@192.168.75.139:/etc/kubernetes/admin.conf $HOME/.kube/config
$ chown $(id -u):$(id -g) $HOME/.kube/config
$ kubectl get nodes
{% endhighlight %}

在 master 确认所有节点 ready

{% highlight bash %}
$ kubectl get nodes
NAME         STATUS    ROLES     AGE       VERSION
k8s-master   Ready     master    37m       v1.8.4
k8s-node-2   Ready     <none>    28m       v1.8.4
k8s-node-3   Ready     <none>    28m       v1.8.4

$ kubectl get pod --all-namespaces -o wide
NAMESPACE     NAME                                    READY     STATUS    RESTARTS   AGE       IP               NODE
kube-system   etcd-k8s-master                         1/1       Running   4          3d        192.168.75.139   k8s-master
kube-system   kube-apiserver-k8s-master               1/1       Running   4          3d        192.168.75.139   k8s-master
kube-system   kube-controller-manager-k8s-master      1/1       Running   5          3d        192.168.75.139   k8s-master
kube-system   kube-dns-545bc4bfd4-zd8ph               3/3       Running   12         3d        10.244.0.6       k8s-master
kube-system   kube-flannel-ds-j4c6r                   1/1       Running   0          6m        192.168.75.142   k8s-node-3
kube-system   kube-flannel-ds-j5vm5                   1/1       Running   4          3d        192.168.75.140   k8s-node-2
kube-system   kube-flannel-ds-nnvfs                   1/1       Running   4          3d        192.168.75.139   k8s-master
kube-system   kube-proxy-bjsj5                        1/1       Running   4          3d        192.168.75.140   k8s-node-2
kube-system   kube-proxy-t9tfn                        1/1       Running   4          3d        192.168.75.139   k8s-master
kube-system   kube-proxy-zgrb7                        1/1       Running   0          6m        192.168.75.142   k8s-node-3
kube-system   kube-scheduler-k8s-master               1/1       Running   5          3d        192.168.75.139   k8s-master
{% endhighlight %}


安装 dashboard
=================================

准备 Docker 镜像
---------------------------------

{% highlight bash %}
docker pull gcr.io/google_containers/kubernetes-dashboard-amd64:v1.8.0
{% endhighlight %}

可以使用如下脚本拉取到本地。

{% highlight bash %}
$ vi pull_k8s_dashboard_img.sh
#!/bin/bash
set -o errexit
set -o nounset
set -o pipefail

KUBE_DASHBOARD_VERSION=v1.8.0

GCR_URL=gcr.io/google_containers
ALIYUN_URL=registry.cn-hangzhou.aliyuncs.com/batizhao

images=(kubernetes-dashboard-amd64:${KUBE_DASHBOARD_VERSION})

for imageName in ${images[@]} ; do
  docker pull $ALIYUN_URL/$imageName
  docker tag $ALIYUN_URL/$imageName $GCR_URL/$imageName
  docker rmi $ALIYUN_URL/$imageName
done
$ chmod +x pull_k8s_dashboard_img.sh
$ ./pull_k8s_dashboard_img.sh
{% endhighlight %}

初始化

{% highlight bash %}
$ kubectl delete -f https://raw.githubusercontent.com/batizhao/dockerfile/master/k8s/kubernetes-dashboard/kubernetes-dashboard.yaml
$ kubectl delete -f https://raw.githubusercontent.com/batizhao/dockerfile/master/k8s/kubernetes-dashboard/kubernetes-dashboard-admin.rbac.yaml
$ kubectl apply -f https://raw.githubusercontent.com/batizhao/dockerfile/master/k8s/kubernetes-dashboard/kubernetes-dashboard.yaml
$ kubectl apply -f https://raw.githubusercontent.com/batizhao/dockerfile/master/k8s/kubernetes-dashboard/kubernetes-dashboard-admin.rbac.yaml
{% endhighlight %}

确认 dashboard 状态

{% highlight bash %}
$ kubectl get pod --all-namespaces -o wide|grep -e dashboard -e NAMESPACE
NAMESPACE     NAME                                    READY     STATUS    RESTARTS   AGE       IP               NODE
kube-system   kubernetes-dashboard-7486b894c6-65l8c   1/1       Running   0          31m       10.244.2.2       k8s-node-3
{% endhighlight %}

访问

[https://192.168.75.139:30000/](https://192.168.75.139:30000/)

访问出错，

![/images/blog/kubernetes/02-kubernetes-install/01-connection-provate.png](/images/blog/kubernetes/02-kubernetes-install/01-connection-provate.png)


[https://192.168.75.139:6443/ui/](https://192.168.75.139:6443/ui/)

报错如下

{% highlight bash %}
{
  "kind": "Status",
  "apiVersion": "v1",
  "metadata": {
    
  },
  "status": "Failure",
  "message": "forbidden: User \"system:anonymous\" cannot get path \"/ui/\"",
  "reason": "Forbidden",
  "details": {
    
  },
  "code": 403
}
{% endhighlight %}

Kubernetes API Server新增了–anonymous-auth选项，允许匿名请求访问secure port。没有被其他authentication方法拒绝的请求即Anonymous requests， 这样的匿名请求的username为system:anonymous, 归属的组为system:unauthenticated。并且该选线是默认的。这样一来，当采用chrome浏览器访问dashboard UI时很可能无法弹出用户名、密码输入对话框，导致后续authorization失败。为了保证用户名、密码输入对话框的弹出，需要将–anonymous-auth设置为false
在api-server配置文件中添加--anonymous-auth=false

访问

[https://192.168.75.139:6443/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/](https://192.168.75.139:6443/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/)


查看登录 token

{% highlight bash %}
$ kubectl -n kube-system get secret | grep kubernetes-dashboard-admin
kubernetes-dashboard-admin-token-8sl79   kubernetes.io/service-account-token   3         15m
$ kubectl describe -n kube-system secret/kubernetes-dashboard-admin-token-8sl79
{% endhighlight %}


安装 heapster
=================================

准备 Docker 镜像

{% highlight bash %}
docker pull gcr.io/google_containers/heapster-amd64:v1.4.0
docker pull gcr.io/google_containers/heapster-grafana-amd64:v4.4.3
docker pull gcr.io/google_containers/heapster-influxdb-amd64:v1.3.3
{% endhighlight %}

可以使用下面脚本拉取到本地。

{% highlight bash %}
$ vi pull_k8s_heapster_img.sh
#!/bin/bash
set -o errexit
set -o nounset
set -o pipefail

GCR_URL=gcr.io/google_containers
ALIYUN_URL=registry.cn-hangzhou.aliyuncs.com/batizhao

images=(heapster-amd64:v1.4.0
heapster-grafana-amd64:v4.4.3
heapster-influxdb-amd64:v1.3.3)


for imageName in ${images[@]} ; do
  docker pull $ALIYUN_URL/$imageName
  docker tag $ALIYUN_URL/$imageName $GCR_URL/$imageName
  docker rmi $ALIYUN_URL/$imageName
done
$ chmod +x pull_k8s_heapster_img.sh
$ ./pull_k8s_heapster_img.sh
{% endhighlight %}

初始化

{% highlight bash %}
$ kubectl apply -f https://raw.githubusercontent.com/batizhao/dockerfile/master/k8s/heapster/heapster-rbac.yaml
$ kubectl apply -f https://raw.githubusercontent.com/batizhao/dockerfile/master/k8s/heapster/grafana.yaml
$ kubectl apply -f https://raw.githubusercontent.com/batizhao/dockerfile/master/k8s/heapster/heapster.yaml 
$ kubectl apply -f https://raw.githubusercontent.com/batizhao/dockerfile/master/k8s/heapster/influxdb.yaml
{% endhighlight %}


参考资料
=========================

https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/#deploying-the-dashboard-ui
https://blog.csdn.net/a632189007/article/details/78840971
本文大部分内容转载自此处 http://batizhao.github.io/2017/12/15/install-kubernetes-1-8-4-use-kubeadm/