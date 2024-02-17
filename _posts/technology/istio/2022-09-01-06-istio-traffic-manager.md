---
layout: post
title:  Istio - 06 - 流量管理
date:   2022-09-01 18:00:00 +0800
categories: 技术文档
tag: Kubernetes
---

* content
{:toc}


## 0. 准备

+ 设置所有的destination rule
```
$ kubectl apply -f samples/bookinfo/networking/destination-rule-all.yaml -n istio-demo
destinationrule.networking.istio.io/productpage created
destinationrule.networking.istio.io/reviews created
destinationrule.networking.istio.io/ratings created
destinationrule.networking.istio.io/details created
```
+ book-info 源码
[https://github.com/istio/istio/tree/master/samples/bookinfo](https://github.com/istio/istio/tree/master/samples/bookinfo)


## 1. 流量转发

```bash
# 部署所有的virtual service
$ kubectl apply -f samples/bookinfo/networking/virtual-service-all-v1.yaml -n istio-demo
virtualservice.networking.istio.io/productpage created
virtualservice.networking.istio.io/reviews created
virtualservice.networking.istio.io/ratings created
virtualservice.networking.istio.io/details created
# 查看部署的所有virtual service
$ kubectl get virtualservices -o yaml -n istio-demo
apiVersion: v1
items:
- apiVersion: networking.istio.io/v1beta1
  kind: VirtualService
  metadata:
    name: bookinfo
    namespace: istio-demo
  spec:
    gateways:
    - bookinfo-gateway
    hosts:
    - istio.wse-test-10d7d95763d0f236970efbfbd8681327-0001.eu-de.containers.appdomain.cloud
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
- apiVersion: networking.istio.io/v1beta1
  kind: VirtualService
  metadata:
    name: details
    namespace: istio-demo
  spec:
    hosts:
    - details
    http:
    - route:
      - destination:
          host: details
          subset: v1
- apiVersion: networking.istio.io/v1beta1
  kind: VirtualService
  metadata:
    name: productpage
    namespace: istio-demo
  spec:
    hosts:
    - productpage
    http:
    - route:
      - destination:
          host: productpage
          subset: v1
- apiVersion: networking.istio.io/v1beta1
  kind: VirtualService
  metadata:
    name: ratings
    namespace: istio-demo
  spec:
    hosts:
    - ratings
    http:
    - route:
      - destination:
          host: ratings
          subset: v1
- apiVersion: networking.istio.io/v1beta1
  kind: VirtualService
  metadata:
    name: reviews
    namespace: istio-demo
  spec:
    hosts:
    - reviews
    http:
    - route:
      - destination:
          host: reviews
          subset: v1
kind: List
metadata:
  resourceVersion: ""
  selfLink: ""
# 查看部署的所有destination rule
$ kubectl get destinationrules -o yaml -n istio-demo
apiVersion: v1
items:
- apiVersion: networking.istio.io/v1beta1
  kind: DestinationRule
  metadata:
    name: details
    namespace: istio-demo
  spec:
    host: details
    subsets:
    - labels:
        version: v1
      name: v1
    - labels:
        version: v2
      name: v2
- apiVersion: networking.istio.io/v1beta1
  kind: DestinationRule
  metadata:
    name: productpage
    namespace: istio-demo
  spec:
    host: productpage
    subsets:
    - labels:
        version: v1
      name: v1
- apiVersion: networking.istio.io/v1beta1
  kind: DestinationRule
  metadata:
    name: ratings
    namespace: istio-demo
  spec:
    host: ratings
    subsets:
    - labels:
        version: v1
      name: v1
    - labels:
        version: v2
      name: v2
    - labels:
        version: v2-mysql
      name: v2-mysql
    - labels:
        version: v2-mysql-vm
      name: v2-mysql-vm
- apiVersion: networking.istio.io/v1beta1
  kind: DestinationRule
  metadata:
    name: reviews
    namespace: istio-demo
  spec:
    host: reviews
    subsets:
    - labels:
        version: v1
      name: v1
    - labels:
        version: v2
      name: v2
    - labels:
        version: v3
      name: v3
kind: List
metadata:
  resourceVersion: ""
  selfLink: ""
```

+ 基于用户的流量转发

```bash
$ kubectl apply -f samples/bookinfo/networking/virtual-service-reviews-test-v2.yaml -n istio-demo
virtualservice.networking.istio.io/reviews configured
$ cat samples/bookinfo/networking/virtual-service-reviews-test-v2.yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: reviews
spec:
  hosts:
    - reviews
  http:
  - match:
    - headers:
        end-user:
          exact: jason
    route:
    - destination:
        host: reviews
        subset: v2
  - route:
    - destination:
        host: reviews
        subset: v1
```

+ 访问网站，[http://istio.wse-test-10d7d95763d0f236970efbfbd8681327-0001.eu-de.containers.appdomain.cloud/productpage](http://istio.wse-test-10d7d95763d0f236970efbfbd8681327-0001.eu-de.containers.appdomain.cloud/productpage)
+ 正常访问是没有star功能的，当使用jason/jason进行登录的时候，页面会显示star功能


## 2. 故障注入(Fault Injection)

+ 在配置了网络（包括故障恢复策略）之后，可以使用Istio的故障注入机制来测试整个应用程序的故障恢复能力。故障注入是一种将错误引入系统的测试方法，以确保系统能够承受并从错误条件中恢复。使用故障注入对于确保故障恢复策略不兼容或限制性太强（可能导致关键服务不可用）特别有用。

```bash
# 创建一个故障注入规则,当使用jason用户访问ratings服务并且超过7秒之后报错
$ kubectl apply -f samples/bookinfo/networking/virtual-service-ratings-test-delay.yaml -n istio-demo
$ cat samples/bookinfo/networking/virtual-service-ratings-test-delay.yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: ratings
spec:
  hosts:
  - ratings
  http:
  - match:
    - headers:
        end-user:
          exact: jason
    fault:
      delay:
        percentage:
          value: 100.0
        fixedDelay: 7s
    route:
    - destination:
        host: ratings
        subset: v1
  - route:
    - destination:
        host: ratings
        subset: v1
```
+ reviews -> rating 之间的超时是10s
+ percentage -> reviews之间的超时设置为3s+1次重试，共6秒
+ 所以即使以上配置了7s，但是仍然会在6s之后报错。报错如下：

![/images/blog/istio/06-istio-traffic-manager/01-error.png](/images/blog/istio/06-istio-traffic-manager/01-error.png)

+ 还可以直接配置http abort错误

```bash
$ kubectl apply -f samples/bookinfo/networking/virtual-service-ratings-test-abort.yaml -n istio-demo
$ cat samples/bookinfo/networking/virtual-service-ratings-test-abort.yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: ratings
spec:
  hosts:
  - ratings
  http:
  - match:
    - headers:
        end-user:
          exact: jason
    fault:
      abort:
        percentage:
          value: 100.0
        httpStatus: 500
    route:
    - destination:
        host: ratings
        subset: v1
  - route:
    - destination:
        host: ratings
        subset: v1
```

+ 访问结果如图
![/images/blog/istio/06-istio-traffic-manager/02-book-review.png](/images/blog/istio/06-istio-traffic-manager/02-book-review.png)


## 3. 熔断
+ 配置httpbin服务

```bash
# 如果配置了sidecar自动注入功能的话
$ kubectl apply -f samples/httpbin/httpbin.yaml -n istio-demo
# 如果未配置sidecar自动注入功能，需要手动inject的话执行如下命令
$ kubectl apply -f <(istioctl kube-inject -f samples/httpbin/httpbin.yaml)  -n istio-demo
```

+ 创建一个destinationrule

```bash
$ kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: httpbin
  namespace: istio-demo
spec:
  host: httpbin
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 1
      http:
        http1MaxPendingRequests: 1
        maxRequestsPerConnection: 1
    outlierDetection:
      consecutiveErrors: 1
      interval: 1s
      baseEjectionTime: 3m
      maxEjectionPercent: 100
EOF
# 验证destinationrule是否创建成功
$ kubectl get destinationrule httpbin -o yaml -n istio-demo
```

+ 添加客户端

```bash
# 当开启了sidecar自动注入功能之后
$ kubectl apply -f samples/httpbin/sample-client/fortio-deploy.yaml -n istio-demo
# 当未开启sidecar自动注入功能，需要手动注入的时候
$ kubectl apply -f <(istioctl kube-inject -f samples/httpbin/sample-client/fortio-deploy.yaml) -n istio-demo
```

+ 集群内执行如下测试httpbin是否部署成功

```bash
$ export FORTIO_POD=$(kubectl get pods -lapp=fortio -o 'jsonpath={.items[0].metadata.name}' -n istio-demo)
$ echo $FORTIO_POD
fortio-deploy-6dc9b4d7d9-7vklk
$ kubectl exec "$FORTIO_POD" -n istio-demo -c fortio -- /usr/bin/fortio curl -quiet http://httpbin:8000/get
HTTP/1.1 200 OK
server: envoy
date: Fri, 15 Jan 2021 05:45:07 GMT
content-type: application/json
content-length: 628
access-control-allow-origin: *
access-control-allow-credentials: true
x-envoy-upstream-service-time: 24

{
  "args": {}, 
  "headers": {
    "Content-Length": "0", 
    "Host": "httpbin:8000", 
    "User-Agent": "fortio.org/fortio-1.11.3", 
    "X-B3-Parentspanid": "2bd7deebc51cf0d0", 
    "X-B3-Sampled": "1", 
    "X-B3-Spanid": "91c2fad20f13e71c", 
    "X-B3-Traceid": "1100140ea1947c3c2bd7deebc51cf0d0", 
    "X-Envoy-Attempt-Count": "1", 
    "X-Forwarded-Client-Cert": "By=spiffe://cluster.local/ns/istio-demo/sa/httpbin;Hash=9a315721ade1f739c94d86fe5f2ceae43c59fa9ec4d9b9e94923f654ae55796f;Subject=\"\";URI=spiffe://cluster.local/ns/istio-demo/sa/default"
  }, 
  "origin": "127.0.0.1", 
  "url": "http://httpbin:8000/get"
}
```

+ 测试熔断

```bash
# 设置2个并发(-c 2)，并发送20个request(-n 20)
$ kubectl exec "$FORTIO_POD" -n istio-demo -c fortio -- /usr/bin/fortio load -c 2 -qps 0 -n 20 -loglevel Warning http://httpbin:8000/get
05:48:11 I logger.go:127> Log level is now 3 Warning (was 2 Info)
Fortio 1.11.3 running at 0 queries per second, 8->8 procs, for 20 calls: http://httpbin:8000/get
Starting at max qps with 2 thread(s) [gomax 8] for exactly 20 calls (10 per thread + 0)
05:48:11 W http_client.go:693> Parsed non ok code 503 (HTTP/1.1 503)
05:48:11 W http_client.go:693> Parsed non ok code 503 (HTTP/1.1 503)
05:48:11 W http_client.go:693> Parsed non ok code 503 (HTTP/1.1 503)
05:48:11 W http_client.go:693> Parsed non ok code 503 (HTTP/1.1 503)
05:48:11 W http_client.go:693> Parsed non ok code 503 (HTTP/1.1 503)
05:48:11 W http_client.go:693> Parsed non ok code 503 (HTTP/1.1 503)
Ended after 50.09084ms : 20 calls. qps=399.27
Aggregated Function Time : count 20 avg 0.004879092 +/- 0.0039 min 0.000407863 max 0.015076906 sum 0.09758184
# range, mid point, percentile, count
>= 0.000407863 <= 0.001 , 0.000703932 , 20.00, 4
> 0.002 <= 0.003 , 0.0025 , 45.00, 5
> 0.003 <= 0.004 , 0.0035 , 50.00, 1
> 0.004 <= 0.005 , 0.0045 , 60.00, 2
> 0.005 <= 0.006 , 0.0055 , 65.00, 1
> 0.006 <= 0.007 , 0.0065 , 80.00, 3
> 0.009 <= 0.01 , 0.0095 , 85.00, 1
> 0.01 <= 0.011 , 0.0105 , 95.00, 2
> 0.014 <= 0.0150769 , 0.0145385 , 100.00, 1
# target 50% 0.004
# target 75% 0.00666667
# target 90% 0.0105
# target 99% 0.0148615
# target 99.9% 0.0150554
Sockets used: 8 (for perfect keepalive, would be 2)
Jitter: false
Code 200 : 14 (70.0 %)
Code 503 : 6 (30.0 %)
Response Header Sizes : count 20 avg 161 +/- 105.4 min 0 max 230 sum 3220
Response Body/Total Sizes : count 20 avg 672.9 +/- 282.7 min 241 max 858 sum 13458
All done 20 calls (plus 0 warmup) 4.879 ms avg, 399.3 qps

$ kubectl exec "$FORTIO_POD" -n istio-demo -c fortio -- /usr/bin/fortio load -c 3 -qps 0 -n 30 -loglevel Warning http://httpbin:8000/get
05:49:55 I logger.go:127> Log level is now 3 Warning (was 2 Info)
Fortio 1.11.3 running at 0 queries per second, 8->8 procs, for 30 calls: http://httpbin:8000/get
Starting at max qps with 3 thread(s) [gomax 8] for exactly 30 calls (10 per thread + 0)
05:49:55 W http_client.go:693> Parsed non ok code 503 (HTTP/1.1 503)
05:49:55 W http_client.go:693> Parsed non ok code 503 (HTTP/1.1 503)
05:49:55 W http_client.go:693> Parsed non ok code 503 (HTTP/1.1 503)
05:49:55 W http_client.go:693> Parsed non ok code 503 (HTTP/1.1 503)
05:49:55 W http_client.go:693> Parsed non ok code 503 (HTTP/1.1 503)
05:49:55 W http_client.go:693> Parsed non ok code 503 (HTTP/1.1 503)
05:49:55 W http_client.go:693> Parsed non ok code 503 (HTTP/1.1 503)
05:49:55 W http_client.go:693> Parsed non ok code 503 (HTTP/1.1 503)
05:49:55 W http_client.go:693> Parsed non ok code 503 (HTTP/1.1 503)
05:49:55 W http_client.go:693> Parsed non ok code 503 (HTTP/1.1 503)
Ended after 45.473167ms : 30 calls. qps=659.73
Aggregated Function Time : count 30 avg 0.0030997605 +/- 0.004012 min 0.00024028 max 0.021725863 sum 0.092992815
# range, mid point, percentile, count
>= 0.00024028 <= 0.001 , 0.00062014 , 30.00, 9
> 0.001 <= 0.002 , 0.0015 , 33.33, 1
> 0.002 <= 0.003 , 0.0025 , 70.00, 11
> 0.003 <= 0.004 , 0.0035 , 83.33, 4
> 0.004 <= 0.005 , 0.0045 , 86.67, 1
> 0.006 <= 0.007 , 0.0065 , 90.00, 1
> 0.007 <= 0.008 , 0.0075 , 93.33, 1
> 0.008 <= 0.009 , 0.0085 , 96.67, 1
> 0.02 <= 0.0217259 , 0.0208629 , 100.00, 1
# target 50% 0.00245455
# target 75% 0.003375
# target 90% 0.007
# target 99% 0.0212081
# target 99.9% 0.0216741
Sockets used: 12 (for perfect keepalive, would be 3)
Jitter: false
Code 200 : 20 (66.7 %)
Code 503 : 10 (33.3 %)
Response Header Sizes : count 30 avg 153.36667 +/- 108.4 min 0 max 231 sum 4601
Response Body/Total Sizes : count 30 avg 652.36667 +/- 290.9 min 241 max 859 sum 19571
All done 30 calls (plus 0 warmup) 3.100 ms avg, 659.7 qps
```

+ 以上两个测试会发现会有一些失败的例子，即熔断发生的场景
	+ Code 200 : 20 (66.7 %)
	+ Code 503 : 10 (33.3 %)
+ 查看istio-proxy可以得到相关的失败数，其中upstram_rq_pending_overflow:96 表示被标记为熔断

```bash
$ kubectl exec "$FORTIO_POD" -n istio-demo -c istio-proxy -- pilot-agent request GET stats | grep httpbin | grep pending
cluster.outbound|8000||httpbin.istio-demo.svc.cluster.local.circuit_breakers.default.rq_pending_open: 0
cluster.outbound|8000||httpbin.istio-demo.svc.cluster.local.circuit_breakers.high.rq_pending_open: 0
cluster.outbound|8000||httpbin.istio-demo.svc.cluster.local.upstream_rq_pending_active: 0
cluster.outbound|8000||httpbin.istio-demo.svc.cluster.local.upstream_rq_pending_failure_eject: 0
cluster.outbound|8000||httpbin.istio-demo.svc.cluster.local.upstream_rq_pending_overflow: 96
cluster.outbound|8000||httpbin.istio-demo.svc.cluster.local.upstream_rq_pending_total: 87
```

## 4. 请求超时
+ 先执行如下进行准备
```bash
$ kubectl apply -f samples/bookinfo/networking/virtual-service-all-v1.yaml -n istio-demo
virtualservice.networking.istio.io/productpage unchanged
virtualservice.networking.istio.io/reviews configured
virtualservice.networking.istio.io/ratings configured
virtualservice.networking.istio.io/details unchanged
```

+ 配置review的请求进入v2

```bash
$ kubectl apply -n istio-demo -f - <<EOF
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: reviews
spec:
  hosts:
    - reviews
  http:
  - route:
    - destination:
        host: reviews
        subset: v2
EOF
```

+ 给ratings服务添加2秒的错误注入延迟

```bash
$ kubectl apply -n istio-demo -f - <<EOF
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: ratings
spec:
  hosts:
  - ratings
  http:
  - fault:
      delay:
        percent: 100
        fixedDelay: 2s
    route:
    - destination:
        host: ratings
        subset: v1
EOF
```

+ 打开[http://istio.wse-test-10d7d95763d0f236970efbfbd8681327-0001.eu-de.containers.appdomain.cloud/productpage](http://istio.wse-test-10d7d95763d0f236970efbfbd8681327-0001.eu-de.containers.appdomain.cloud/productpage)
+ 两秒之后服务正常显示

+ 然后给reviews服务添加一个0.5秒的timeout

```bash
$ kubectl apply -n istio-demo -f - <<EOF
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: reviews
spec:
  hosts:
  - reviews
  http:
  - route:
    - destination:
        host: reviews
        subset: v2
    timeout: 0.5s
EOF
```
+ 然后刷新页面，会发现大约1秒左右，会返回结果，显示Review服务不可用。


## 5. 流量转换
+ 执行如下命令确保所有的流量都打在v1上

```bash
$ kubectl apply -f samples/bookinfo/networking/virtual-service-all-v1.yaml -n istio-demo
virtualservice.networking.istio.io/productpage unchanged
virtualservice.networking.istio.io/reviews configured
virtualservice.networking.istio.io/ratings configured
virtualservice.networking.istio.io/details unchanged
```

+ 打开http://istio.wse-test-10d7d95763d0f236970efbfbd8681327-0001.eu-de.containers.appdomain.cloud/productpage
+ 发现服务正常访问
+ 从reviews:v1迁移50%的流量到v3

```bash
$ kubectl apply -f samples/bookinfo/networking/virtual-service-reviews-50-v3.yaml -n istio-demo
```

+ 稍等一会然后查看规则是否配置成功

```bash
$ kubectl get virtualservice reviews -o yaml -n istio-demo
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: reviews
  namespace: istio-demo
spec:
  hosts:
  - reviews
  http:
  - route:
    - destination:
        host: reviews
        subset: v1
      weight: 50
    - destination:
        host: reviews
        subset: v3
      weight: 50
```
+ 然后不停刷新页面，会发现页面时而显示star功能，时而没有

+ 当v3稳定的时候迁移所有的流量到v3

```bash
$ kubectl apply -f samples/bookinfo/networking/virtual-service-reviews-v3.yaml -n istio-demo
virtualservice.networking.istio.io/reviews configured
```

+ 当然还可以配置tcp的流量转换，参考https://istio.io/latest/docs/tasks/traffic-management/tcp-traffic-shifting/

## 6. 流量镜像

+ 分别部署httpbin-v1和httpbin-v2

```bash
# httpbin-v1
$ cat <<EOF | kubectl create -n istio-demo -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: httpbin-v1
spec:
  replicas: 1
  selector:
    matchLabels:
      app: httpbin
      version: v1
  template:
    metadata:
      labels:
        app: httpbin
        version: v1
    spec:
      containers:
      - image: docker.io/kennethreitz/httpbin
        imagePullPolicy: IfNotPresent
        name: httpbin
        command: ["gunicorn", "--access-logfile", "-", "-b", "0.0.0.0:80", "httpbin:app"]
        ports:
        - containerPort: 80
EOF
deployment.apps/httpbin-v1 created

# httpbin-v2
$ cat <<EOF | kubectl create -n istio-demo -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: httpbin-v2
spec:
  replicas: 1
  selector:
    matchLabels:
      app: httpbin
      version: v2
  template:
    metadata:
      labels:
        app: httpbin
        version: v2
    spec:
      containers:
      - image: docker.io/kennethreitz/httpbin
        imagePullPolicy: IfNotPresent
        name: httpbin
        command: ["gunicorn", "--access-logfile", "-", "-b", "0.0.0.0:80", "httpbin:app"]
        ports:
        - containerPort: 80
EOF
deployment.apps/httpbin-v2 created
```

+ 部署kubernetes service
```bash
$ kubectl apply -n istio-demo -f - <<EOF
apiVersion: v1
kind: Service
metadata:
  name: httpbin
  labels:
    app: httpbin
spec:
  ports:
  - name: http
    port: 8000
    targetPort: 80
  selector:
    app: httpbin
EOF
```

+ 部署后台服务确保之后可以通过curl进行测试

```bash
$ cat <<EOF | kubectl create -n istio-demo -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sleep
spec:
  replicas: 1
  selector:
    matchLabels:
      app: sleep
  template:
    metadata:
      labels:
        app: sleep
    spec:
      containers:
      - name: sleep
        image: tutum/curl
        command: ["/bin/sleep","infinity"]
        imagePullPolicy: IfNotPresent
EOF
deployment.apps/sleep created
```

+ 创建一个默认的路由规则，将所有的流量发送到v1

```bash
$ kubectl apply -n istio-demo -f - <<EOF
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: httpbin
spec:
  hosts:
    - httpbin
  http:
  - route:
    - destination:
        host: httpbin
        subset: v1
      weight: 100
---
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: httpbin
spec:
  host: httpbin
  subsets:
  - name: v1
    labels:
      version: v1
  - name: v2
    labels:
      version: v2
EOF

virtualservice.networking.istio.io/httpbin created
destinationrule.networking.istio.io/httpbin configured
```

+ 访问一下这个service

```bash
$ export SLEEP_POD=$(kubectl get pod -n istio-demo -l app=sleep -o jsonpath={.items..metadata.name})
$ echo $SLEEP_POD
$ kubectl exec "${SLEEP_POD}" -n istio-demo  -c sleep -- curl -s http://httpbin:8000/headers
{
  "headers": {
    "Accept": "*/*", 
    "Content-Length": "0", 
    "Host": "httpbin:8000", 
    "User-Agent": "curl/7.35.0", 
    "X-B3-Parentspanid": "aa6d4c438cd18256", 
    "X-B3-Sampled": "1", 
    "X-B3-Spanid": "30d3240e1b306aea", 
    "X-B3-Traceid": "35f31d58ba883067aa6d4c438cd18256", 
    "X-Envoy-Attempt-Count": "1", 
    "X-Forwarded-Client-Cert": "By=spiffe://cluster.local/ns/istio-demo/sa/default;Hash=49fd537b4825d9aeba76e596975aad76694bf1ff6d2891716020774e221e495e;Subject=\"\";URI=spiffe://cluster.local/ns/istio-demo/sa/default"
  }
}
```

+ 分别查看httpbin v1和v2的日志

```bash
$ export V1_POD=$(kubectl get pod -n istio-demo -l app=httpbin,version=v1 -o jsonpath={.items..metadata.name})
$ echo $V1_POD
$ kubectl logs "$V1_POD" -n istio-demo -c httpbin
[2021-01-18 01:30:46 +0000] [1] [INFO] Starting gunicorn 19.9.0
[2021-01-18 01:30:46 +0000] [1] [INFO] Listening at: http://0.0.0.0:80 (1)
[2021-01-18 01:30:46 +0000] [1] [INFO] Using worker: sync
[2021-01-18 01:30:46 +0000] [10] [INFO] Booting worker with pid: 10
127.0.0.1 - - [18/Jan/2021:01:32:21 +0000] "GET /headers HTTP/1.1" 200 559 "-" "curl/7.35.0"

$ export V2_POD=$(kubectl get pod -n istio-demo -l app=httpbin,version=v2 -o jsonpath={.items..metadata.name})
$ echo $V2_POD
$ kubectl logs "$V2_POD" -n istio-demo -c httpbin
[2021-01-18 01:31:13 +0000] [1] [INFO] Starting gunicorn 19.9.0
[2021-01-18 01:31:13 +0000] [1] [INFO] Listening at: http://0.0.0.0:80 (1)
[2021-01-18 01:31:13 +0000] [1] [INFO] Using worker: sync
[2021-01-18 01:31:13 +0000] [9] [INFO] Booting worker with pid: 9
```

+ 镜像流量到V2

```bash
$ kubectl apply -n istio-demo -f - <<EOF
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: httpbin
spec:
  hosts:
    - httpbin
  http:
  - route:
    - destination:
        host: httpbin
        subset: v1
      weight: 100
    mirror:
      host: httpbin
      subset: v2
    mirror_percent: 100
EOF
```

+ 发送测试流量

```bash
$ kubectl exec "${SLEEP_POD}" -n istio-demo -c sleep -- curl -s http://httpbin:8000/headers
{
  "headers": {
    "Accept": "*/*", 
    "Content-Length": "0", 
    "Host": "httpbin:8000", 
    "User-Agent": "curl/7.35.0", 
    "X-B3-Parentspanid": "9604a739a5d1e918", 
    "X-B3-Sampled": "1", 
    "X-B3-Spanid": "518f226e025df5fd", 
    "X-B3-Traceid": "79d7712d8bd900319604a739a5d1e918", 
    "X-Envoy-Attempt-Count": "1", 
    "X-Forwarded-Client-Cert": "By=spiffe://cluster.local/ns/istio-demo/sa/default;Hash=49fd537b4825d9aeba76e596975aad76694bf1ff6d2891716020774e221e495e;Subject=\"\";URI=spiffe://cluster.local/ns/istio-demo/sa/default"
  }
}
```

+ 分别查看v1和v2的日志

```bash
$ kubectl logs "$V1_POD" -n istio-demo -c httpbin
127.0.0.1 - - [18/Jan/2021:01:37:23 +0000] "GET /headers HTTP/1.1" 200 559 "-" "curl/7.35.0"
$ kubectl logs "$V2_POD" -n istio-demo -c httpbin
127.0.0.1 - - [18/Jan/2021:01:37:23 +0000] "GET /headers HTTP/1.1" 200 599 "-" "curl/7.35.0"
```

## 参考文档

[https://istio.io/latest/docs/tasks/traffic-management](https://istio.io/latest/docs/tasks/traffic-management)
[https://jimmysong.io/istio-handbook/concepts/traffic-management-basic.html](https://jimmysong.io/istio-handbook/concepts/traffic-management-basic.html)
[https://istio.io/latest/zh/docs/concepts/traffic-management/](https://istio.io/latest/zh/docs/concepts/traffic-management/)
[https://istio.io/latest/docs/examples/bookinfo/](https://istio.io/latest/docs/examples/bookinfo/)
[https://izsk.me/2020/02/29/Istio-VirtualService-DestinationRule/](https://izsk.me/2020/02/29/Istio-VirtualService-DestinationRule/)
[https://github.com/istio/istio/tree/master/samples/bookinfo](https://github.com/istio/istio/tree/master/samples/bookinfo)
 
