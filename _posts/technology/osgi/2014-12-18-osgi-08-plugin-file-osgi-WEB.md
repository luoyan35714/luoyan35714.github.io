---
layout: post
title:  JAVA OSGi教程(八)-基于plugin.xml文件配置的OSGi实现WEB项目
date:   2014-12-21 00:13:01 +0800
categories: 技术文档
tag: OSGi
---

* content
{:toc}


* 在第七节的基础上，在OSGi_equinox_web项目上右键新建一个File，命名为plugin.xml
* 在META-INF/MANIFEST.MF文件中修改
{% highlight text %}
Bundle-SymbolicName: com.freud.osgi.web
{% endhighlight %}
为
{% highlight text %}
Bundle-SymbolicName: com.freud.osgi.web;singleton:=true
{% endhighlight %}
删除Activator，并且添加红线标注部分

![edit manifest](/images/blog/osgi/8-plugin-file-osgi-WEB/01_edit_manifest.png)

* 修改plugin.xml文件内容如下
{% highlight xml %}
<?xml version="1.0"?>
<plugin>
	<extension point="org.eclipse.equinox.http.registry.resources">
		<resource alias="/files" base-name="/WebContent"/>
	</extension>
	<extension point="org.eclipse.equinox.http.registry.servlets">
		<servlet alias="/hello" class="com.freud.osgi.web.HelloWorldServlet"/>
	</extension>
	<extension point="org.eclipse.equinox.http.registry.servlets">
		<servlet alias="/jsp/*.jsp" class="org.eclipse.equinox.jsp.jasper.registry.JSPFactory:/WebContent/jsp"/>
	</extension>
</plugin>
{% endhighlight %}
* 在项目目录下新建一个文件夹，命名为WebContent
* 在WebContent下新建一个HTML文件，命名为index.html内容如下
{% highlight html %}
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Test html</title>
</head>
<body>
This is the html file -- version 2
</body>
</html>
{% endhighlight %}
* 在WebContent目录下新建一个文件夹，命名为jsp，在jsp下新建一个jsp文件，命名为index.jsp，其内容为
{% highlight jsp %}
<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title>Test jsp</title>
</head>
<body>
This is the jsp file -- version 3
</body>
</html>
{% endhighlight %}
* 运行，以下为运行的Configuration

![run configuration](/images/blog/osgi/8-plugin-file-osgi-WEB/02_run_configuration.png)

* 测试：打开一个浏览器，输入地址：[http://localhost/files/index.html](http://localhost/files/index.html)，得到结果如图

![index.html test result](/images/blog/osgi/8-plugin-file-osgi-WEB/03_index_test.png)

* REST测试：打开一个浏览器，输入地址：[http://localhost/hello](http://localhost/hello)，得到结果如下图

![hello test result](/images/blog/osgi/8-plugin-file-osgi-WEB/04_hello_test.png)

* 测试：打开一个浏览器，输入地址：[http://localhost/jsp/index.jsp](http://localhost/jsp/index.jsp)，得到结果如下图

![index jsp test result](/images/blog/osgi/8-plugin-file-osgi-WEB/05_index_jsp_test.png)

<br/>

参考资料
================================

视频教程 : [http://v.youku.com/v_show/id_XNDE1NzU0OTY0.html](http://v.youku.com/v_show/id_XNDE1NzU0OTY0.html)
<br/>
Equinox OSGi官网 : [http://www.eclipse.org/equinox/](http://www.eclipse.org/equinox/)
<br/>
林昊 : 《OSGi原理与最佳实践》
<br/>
Richard S. Hall : 《OSGi实战》