---
layout: post
title:  Istio - 04 - Kiali-Grafana-Prometheus-Jaeger
date:   2022-09-01 16:00:00 +0800
categories: 技术文档
tag: Kubernetes
---

* content
{:toc}


## 1. 安装Kiali
```bash
$ kubectl apply -f samples/addons
serviceaccount/grafana created
configmap/grafana created
service/grafana created
deployment.apps/grafana created
configmap/istio-grafana-dashboards created
configmap/istio-services-grafana-dashboards created
deployment.apps/jaeger created
service/tracing created
service/zipkin created
customresourcedefinition.apiextensions.k8s.io/monitoringdashboards.monitoring.kiali.io created
serviceaccount/kiali created
configmap/kiali created
clusterrole.rbac.authorization.k8s.io/kiali-viewer created
clusterrole.rbac.authorization.k8s.io/kiali created
clusterrolebinding.rbac.authorization.k8s.io/kiali created
service/kiali created
deployment.apps/kiali created
serviceaccount/prometheus created
configmap/prometheus created
clusterrole.rbac.authorization.k8s.io/prometheus created
clusterrolebinding.rbac.authorization.k8s.io/prometheus created
service/prometheus created
deployment.apps/prometheus created
$ kubectl rollout status deployment/kiali -n istio-system
```

## 2. Access the Kiali dashboard.
```bash
istioctl dashboard kiali                               
http://localhost:20001/kiali
```

## 3. Access the grafana dashboard.
```bash
istioctl dashboard grafana
http://localhost:3000
```

## 4. Access the prometheus dashboard.
```bash
istioctl dashboard prometheus
http://localhost:9090
```

## 5. Access the jaeger dashboard.
```bash
istioctl dashboard jaeger
http://localhost:16686
```