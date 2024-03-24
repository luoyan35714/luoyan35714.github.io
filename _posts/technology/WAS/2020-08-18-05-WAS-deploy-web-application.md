---
layout: post
title:  "Websphere Application Server(05)--部署WEB应用"
date:   2020-08-18 12:31:01 +0800
category : 技术文档
tag: WebSphere Application Server
---

* content
{:toc}


## 1. 创建WEB项目
### 1.1 创建一个Dynamic Web Project
设置`Project Name`，并且选中`Add Project to an EAR`

![图片](/images/blog/WAS/05-deploy-web-application/01-create-web-project.png)

### 1.2 指定对应的Context Root和Context Directory
指定`Context root`和`Content directory`，并选中`Generate web.xml deployment descriptor`

![图片](/images/blog/WAS/05-deploy-web-application/02-setup-project.png)

### 1.3 WEB项目中的代码-Web.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns="http://java.sun.com/xml/ns/javaee"
	xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd"
	id="WebApp_ID" version="3.0">
	<display-name>WAS-01</display-name>
	
	<welcome-file-list>
		<welcome-file>index.jsp</welcome-file>
	</welcome-file-list>

	<servlet>
		<servlet-name>TestServlet1</servlet-name>
		<servlet-class>com.freud.TestServlet1</servlet-class>
	</servlet>
	<servlet-mapping>
		<servlet-name>TestServlet1</servlet-name>
		<url-pattern>/test</url-pattern>
	</servlet-mapping>
</web-app>
```

### 1.4 WEB项目中的代码 - index.jsp
```html
<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<title>HelloWorld</title>
</head>
<body>
HelloWorld index! This is my first WAS application!
</body>
</html>

### 1.5 WEB项目中的代码 - TestServlet1.java
package com.freud.test;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class TestServlet1 extends HttpServlet {

	@Override
	protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		resp.getWriter().write("Hello Test");
	}

}
```

## 2. 生成ear文件
在WAS-01EAR项目上右键`Export` -> `EAR file` -> `导出`

![图片](/images/blog/WAS/05-deploy-web-application/03-ear-config.png)

## 3. 部署应用
### 3.1 创建一个新的cluster
打开WAS Console，依次点击`Servers` -> `Clusters` -> `WebSphere application server clusters` -> `New`, 设置Cluster Name为 `hellocluster`

![图片](/images/blog/WAS/05-deploy-web-application/04-create-cluster.png)

设置cluster的第一个Node，填写信息如下，

![图片](/images/blog/WAS/05-deploy-web-application/05-specify-node.png)

向cluster中添加其他Node，填写相关信息，然后点击`Add Member`

![图片](/images/blog/WAS/05-deploy-web-application/06-add-more-node.png)

选中创建的cluster并`start`

![图片](/images/blog/WAS/05-deploy-web-application/07-start-cluster.png)

### 3.2 创建一个新的Enterprise Application
依次点击`Applications` -> `New Application`

![图片](/images/blog/WAS/05-deploy-web-application/08-new-application.png)

选择`New Enterprise Application`

![图片](/images/blog/WAS/05-deploy-web-application/09-new-enterprise-application.png)

选择刚刚导出的EAR文件

![图片](/images/blog/WAS/05-deploy-web-application/10-choose-ear-file.png)

在`Prepare for the application installation`中，选择`Fast Path`

![图片](/images/blog/WAS/05-deploy-web-application/11-prepare-installation.png)

在`Select Installation Options`中直接`Next`

![图片](/images/blog/WAS/05-deploy-web-application/12-installation-option.png)

在`Map modules to servers`中，选中对应的`cluster`和`servers`，并选中对应的`Modules`

![图片](/images/blog/WAS/05-deploy-web-application/13-map-modules-to-server.png)

选中对应的`virtual host`

![图片](/images/blog/WAS/05-deploy-web-application/14-virtual-host.png)

在`Metadata for modules`中直接`Next`

![图片](/images/blog/WAS/05-deploy-web-application/15-metadata-for-modules.png)

安装预览

![图片](/images/blog/WAS/05-deploy-web-application/16-summary.png)

## 4. 启动应用并验证
### 4.1 启动应用
在WEB Console依次点击 `Applications` -> `Application Types` -> `Websphere enterprise applications`, 选中WAS-01EAR，点击start

![图片](/images/blog/WAS/05-deploy-web-application/17-start-application.png)

### 4.2 验证
[http://192.168.62.191:9080/WAS-01/](http://192.168.62.191:9080/WAS-01/)

![图片](/images/blog/WAS/05-deploy-web-application/18-verify-application.png)

## 5. 启动应用常遇到的问题汇总
### JDK版本错误
当访问 [http://192.168.62.191:9080/WAS-01/test](http://192.168.62.191:9080/WAS-01/test) 的时候遇到如下错误

> Error 404: javax.servlet.UnavailableException: SRVE0200E: Servlet [com.freud.TestServlet1]: Could not find required class - class java.lang.ClassNotFoundException: com.freud.TestServlet1

原因是WAS所依赖的JDK是1.6.0，而Eclipse的编译环境是高于1.6的，需要降低Eclipse的编译版本。

![图片](/images/blog/WAS/05-deploy-web-application/19-fix-jdk-issue.png)


## 6. 日志查看方法
### 6.1 Servers -> Websphere application Server -> Troubleshooting -> Logging and tracing

![图片](/images/blog/WAS/05-deploy-web-application/20-logging-tracing-01.png)

### 6.2 Troubleshooting -> logs and trace

![图片](/images/blog/WAS/05-deploy-web-application/21-logging-tracing-02.png)

### 6.3 直接打开文件夹

| 191 | /opt/IBM/WebSphere/AppServer/profiles/node1/logs/hellocluster-01 |
| 192 | /opt/IBM/WebSphere/AppServer/profiles/node2/logs/hellocluster-02 |






