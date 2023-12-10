---
layout: post
title:  Istio - 05 - 常用组件
date:   2022-09-01 17:00:00 +0800
categories: 技术文档
tag: Kubernetes
---

* content
{:toc}

## gateway
使用网关为网格来管理入站和出站流量，可以让用户指定要进入或离开网格的流量。
![/images/blog/istio/05-istio-resources/01-gateway.png](/images/blog/istio/05-istio-resources/01-gateway.png)

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: bookinfo-gateway
  namespace: istio-demo
spec:
  #selector:
  #  istio: ingressgateway # use istio default controller
  servers:
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - "istio.wse-test.eu-de.containers.appdomain.cloud"
```


## virtual service
要为进入上面的 Gateway 的流量配置相应的路由，必须为同一个 host 定义一个`VirtualService`
通过在`Gateway`上绑定`VirtualService`的方式，可以使用标准的 Istio 规则来控制进入`Gateway`的 HTTP 和 TCP 流量。

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: bookinfo
  namespace: istio-demo
spec:
  hosts:
  - "istio.wse-test.eu-de.containers.appdomain.cloud"
  gateways:
  - bookinfo-gateway
  http:
  - match:
    - uri:
        exact: /productpage
    - uri:
        prefix: /static
    - uri:
        exact: /login
    - uri:
        exact: /logout
    - uri:
        prefix: /api/v1/products
    route:
    - destination:
        host: productpage
        port:
          number: 9080
```

## destination rule
是对目标服务的一次封装，host的默认扩展后缀是default.svc.cluster.local,即service的名字，通过label的判定，生成对应的subset，以提供给virtualservice使用。
```yaml
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: freud-istio
  namespace: istio-demo
spec:
  host: freud-istio
  subsets:
  - name: v1
    labels:
      version: v1
  - name: v2
    labels:
      version: v2
```

## service entry
将网格外的服务加入网络中.流量从Istio出集群的方式有两种，一种是通过Egress Gateway，一种是通过ServiceEntry
```yaml
apiVersion: networking.istio.io/v1alpha3
kind: ServiceEntry
metadata:
  name: svc-entry
spec:
  hosts:
  - "www.baidu.com"
  ports:
  - number: 80
    name: http
    protocol: HTTP
  location: MESH_EXTERNAL
  resolution: DNS
```