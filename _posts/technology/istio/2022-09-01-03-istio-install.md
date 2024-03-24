---
layout: post
title:  Istio - 03 - 安装与验证
date:   2022-09-01 15:00:00 +0800
categories: 技术文档
tag: Kubernetes
---

* content
{:toc}


## 安装Istioctl
+ 1) 下载安装包

```bash
$ curl -L https://istio.io/downloadIstio | sh -
```

+ 2) 设置路径

```bash
$ cd istio-1.7.1
$ export PATH=$PWD/bin:$PATH
```

## 在Kubernetes中安装Istio并尝试部署Demo Project

+ 1) Install Istio

```bash
$ istioctl install --set profile=demo
✔ Istio core installed                                                                                                                                             
✔ Istiod installed                                                                                                                                                 
✔ Egress gateways installed                                                                                                                                        
✔ Ingress gateways installed                                                                                                                                       
✔ Installation complete  
```

+ 2) 设置默认添加Envoy的sidecar

```bash
$ kubectl create ns istio-demo
$ kubectl label namespace istio-demo istio-injection=enabled
namespace/istio-demo labeled
```

+ 3) 修改`samples/bookinfo/platform/kube/bookinfo.yaml`路径下的每个组件添加namespace `istio-demo`
+ 4) 部署bookinfo

```bash
➜  istio-1.7.1 kubectl apply -f samples/bookinfo/platform/kube/bookinfo.yaml
service/details created
serviceaccount/bookinfo-details created
deployment.apps/details-v1 created
service/ratings created
serviceaccount/bookinfo-ratings created
deployment.apps/ratings-v1 created
service/reviews created
serviceaccount/bookinfo-reviews created
deployment.apps/reviews-v1 created
deployment.apps/reviews-v2 created
deployment.apps/reviews-v3 created
service/productpage created
serviceaccount/bookinfo-productpage created
deployment.apps/productpage-v1 created
```

+ 5) 验证部署内容

```bash
$ kubectl get services -n istio-demo
NAME          TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
details       ClusterIP   172.21.147.208   <none>        9080/TCP   10m
productpage   ClusterIP   172.21.201.18    <none>        9080/TCP   10m
ratings       ClusterIP   172.21.128.239   <none>        9080/TCP   10m
reviews       ClusterIP   172.21.152.89    <none>        9080/TCP   10m
$ kubectl get pods -n istio-demo
NAME                              READY   STATUS    RESTARTS   AGE
details-v1-558b8b4b76-ph65m       2/2     Running   0          10m
productpage-v1-6987489c74-sv7gs   2/2     Running   0          10m
ratings-v1-7dc98c7588-ln8pg       2/2     Running   0          10m
reviews-v1-7f99cc4496-wf7jn       2/2     Running   0NAME                              READY   STATUS    RESTARTS   AGE
details-v1-558b8b4b76-ph65m       2/2     Running   0          10m
productpage-v1-6987489c74-sv7gs   2/2     Running   0          10m
ratings-v1-7dc98c7588-ln8pg       2/2     Running   0          10m
reviews-v1-7f99cc4496-wf7jn       2/2     Running   0          10m
reviews-v2-7d79d5bd5d-llvph       2/2     Running   0          10m
reviews-v3-7dbcdcbc56-wgd69       2/2     Running   0          10m10m
reviews-v2-7d79d5bd5d-llvph       2/2     Running   0          10m
reviews-v3-7dbcdcbc56-wgd69       2/2     Running   0          10m
```

+ 6) 验证是否成功 

```bash
$ kubectl exec "$(kubectl get pod -l app=ratings -o jsonpath='{.items[0].metadata.name}' -n istio-demo)"  -n istio-demo -c ratings -- curl -s productpage:9080/productpage| grep -o "<title>.*</title>"
<title>Simple Bookstore App</title>
```

+ 7) 对集群操作

```bash
$ kubectl get svc -n istio-system
NAME                   TYPE           CLUSTER-IP       EXTERNAL-IP     PORT(S)                                                                      AGE
istio-egressgateway    ClusterIP      172.21.97.120    <none>          80/TCP,443/TCP,15443/TCP                                                     29d
istio-ingressgateway   LoadBalancer   172.21.155.248   169.50.28.245   15021:31476/TCP,80:31044/TCP,443:31807/TCP,31400:31677/TCP,15443:30266/TCP   29d
istiod                 ClusterIP      172.21.246.241   <none>          15010/TCP,15012/TCP,443/TCP,15014/TCP,853/TCP                                29d
$ ibmcloud ks nlb-dns create classic --ip 169.50.28.245 --cluster  e7b3d167b0064dd3b3c233f28c34d563
$ ibmcloud ks nlb-dns ls --cluster  e7b3d167b0064dd3b3c233f28c34d563                             
    Hostname                                                                          IP(s)           Health Monitor   SSL Cert Status   SSL Cert Secret Name                             Secret Namespace   
wse-test-10d7d95763d0f236970efbfbd8681327-0001.eu-de.containers.appdomain.cloud   169.50.28.245   None             creating          wse-test-10d7d95763d0f236970efbfbd8681327-0001   default   
wse-test.eu-de.containers.appdomain.cloud                                         169.50.28.246   None             created           wse-test                                         default   
```

+ 8) 对外暴露服务

```bash
# 修改gateway和virtualservice中的域名为如上wse-test-10d7d95763d0f236970efbfbd8681327-0001.eu-de.containers.appdomain.cloud
# 自定义二级域名istio.wse-test-10d7d95763d0f236970efbfbd8681327-0001.eu-de.containers.appdomain.cloud
$ kubectl apply -f samples/bookinfo/networking/bookinfo-gateway.yaml -n istio-demo
gateway.networking.istio.io/bookinfo-gateway created
virtualservice.networking.istio.io/bookinfo created
```

+ 9) 从集群外访问

[http://istio.wse-test-10d7d95763d0f236970efbfbd8681327-0001.eu-de.containers.appdomain.cloud/productpage](http://istio.wse-test-10d7d95763d0f236970efbfbd8681327-0001.eu-de.containers.appdomain.cloud/productpage)
