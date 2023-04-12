---
layout: post
title:  Kubernetes - 10 - 安全管理
date:   2022-07-29 10:00:00 +0800
categories: 技术文档
tag: Kubernetes
---

* content
{:toc}


## RBAC

## ServiceAccount

## 验证管理kubeconfig和token

### kubeconfig

### Token管理
```bash
#创建一个名叫dashboard-admin 命名空间在kube-system 下的服务账户
$ kubectl create serviceaccount dashboard-admin -n kube-system 

#dashboard-admin 绑定为集群账户
#显示出名字为dashboard-admin-*的第一个匹配账户的详细信息
$ kubectl create clusterrolebinding dashboard-admin --clusterrole=cluster-admin --serviceaccount=kube-system:dashboard-admin 
$ kubectl describe secrets -n kube-system $(kubectl -n kube-system get secret | awk '/dashboard-admin/{print $1}') 

# #配置登录方式 这里我使用的是token登录 通过kubectl describe secrets -n kube-system $(kubectl -n kube-system get secret | awk '/dashboard-admin/{print $1}') 命令可以查看一条
kubectl config set-credentials tf-admin --token={上文的Token} 
#配置连接地址
$ kubectl config set-cluster tf-cluster --insecure-skip-tls-verify=true --server={集群的连接地址https://xx.xx.xx.xx:xx} 
$ kubectl config set-context tf-system --cluster=tf-cluster --user=tf-admin
$ kubectl config use-context tf-system  
```

https://blog.csdn.net/weixin_29055137/article/details/113023072

## NetworkPolicy

## Secret & Configmap
