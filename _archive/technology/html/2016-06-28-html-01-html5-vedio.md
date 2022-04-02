---
layout: post
title:  谈谈HTML5中video标签的使用
date:   2016-06-28 12:55:00 +0800
categories: 技术文档
tag: HTML
---

* content
{:toc}


背景
==============================

最近在做一个项目，要用到网页视频播放技术，调研了下现在主流的视频播放技术主要有两种，一是基于Adobe Flash，二是基于HTML5中video标签。两种方式各有利弊。

> * Adobe Flash的方式需要安装插件，并且不支持Safari浏览器。
> * HTML5 video标签仅支持可以渲染HTML5的浏览器，IE的早期系列都不支持。并且考虑到各种浏览器兼容，仅支持H.264编码的MP4格式。

最后的决定是抛弃早起IE的版本，使用HTML5的video标签，好处是开发方便，并且富文本编辑框架用的是CKEditor，集成了HTML5 video标签。


使用
==============================

* 引入[Videojs](http://videojs.com/docs/guides/tracks.html)的CDN链接

{% highlight html %}
<head>
  <link href="http://vjs.zencdn.net/5.8.8/video-js.css" rel="stylesheet">

  <!-- If you'd like to support IE8 -->
  <script src="http://vjs.zencdn.net/ie8/1.1.2/videojs-ie8.min.js"></script>
</head>
{% endhighlight %}

* 在自己的页面中使用

{% highlight html %}
<body>
  <video id="my-video" class="video-js" controls preload="auto" width="640" height="264"
  poster="MY_VIDEO_POSTER.jpg" data-setup="{}">
    <source src="MY_VIDEO.mp4" type='video/mp4'>
    <source src="MY_VIDEO.webm" type='video/webm'>
    <p class="vjs-no-js">
      To view this video please enable JavaScript, and consider upgrading to a web browser that
      <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
    </p>
  </video>

  <script src="http://vjs.zencdn.net/5.8.8/video.js"></script>
</body>
{% endhighlight %}

* videojs的发布版本下载地址[https://github.com/videojs/video.js/releases](https://github.com/videojs/video.js/releases)


问题
==============================

其中遇到一个问题就是在Iphone的Safari浏览器下视频不播放的问题，在使用了videojs之后报错如下：The media could not be loaded, either because the server or network failed or because the format is not supported.
![使用VideoJs后的MP4视频不加载问题](/images/blog/html/01-html5-video/02-vidiojs.PNG)


VideoJs官网有一个BUG说Demo中单引号的问题[https://github.com/videojs/video.js/issues/2945#event-500299257](https://github.com/videojs/video.js/issues/2945#event-500299257)，修改后依然不好用。而当我引入其他网站的视频源的时候是好用的可以正常播放，`<source src="http://diveintohtml5.info/i/pr6.mp4" type="video/mp4">`,所以怀疑是本地Tomcat服务器返回静态资源的Http Response Header有问题。


{% highlight bash %}
[root@localhost backup]# curl -v http://diveintohtml5.info/i/pr6.mp4 > remote
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:--  0:00:03 --:--:--     0* About to connect() to diveintohtml5.info port 80 (#0)
*   Trying 64.111.107.187...
  0     0    0     0    0     0      0      0 --:--:--  0:00:05 --:--:--     0* Connected to diveintohtml5.info (64.111.107.187) port 80 (#0)
> GET /i/pr6.mp4 HTTP/1.1
> User-Agent: curl/7.29.0
> Host: diveintohtml5.info
> Accept: */*
> 
< HTTP/1.1 200 OK
< Date: Tue, 28 Jun 2016 03:32:32 GMT
< Server: Apache
< Last-Modified: Mon, 26 Mar 2012 22:30:07 GMT
< ETag: "f94bf1-4bc2cea9419c0"
< Accept-Ranges: bytes
< Content-Length: 16337905
< Cache-Control: max-age=31536000
< Expires: Wed, 28 Jun 2017 03:32:32 GMT
< Content-Type: video/mp4
< 
{ [data not shown]
100 15.5M  100 15.5M    0     0   692k      0  0:00:23  0:00:23 --:--:-- 1303k
* Connection #0 to host diveintohtml5.info left intact
[root@localhost backup]# curl -v http://localhost/TestSpring/resources/mp4/pr6.mp4 > local
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0* About to connect() to localhost port 80 (#0)
*   Trying localhost...
* Connected to localhost (127.0.0.1) port 80 (#0)
> GET /TestSpring/resources/mp4/pr6.mp4 HTTP/1.1
> User-Agent: curl/7.29.0
> Host: localhost
> Accept: */*
> 
< HTTP/1.1 200 OK
< Server: Apache-Coyote/1.1
< Last-Modified: Tue, 28 Jun 2016 01:36:45 GMT
< Content-Type: video/mp4;charset=UTF-8
< Content-Length: 16337905
< Date: Tue, 28 Jun 2016 03:34:24 GMT
< 
{ [data not shown]
100 15.5M  100 15.5M    0     0  79.1M      0 --:--:-- --:--:-- --:--:-- 79.9M
* Connection #0 to host localhost left intact
{% endhighlight %}


经过对比发现本地Tomcat部署的服务器在请求MP4静态资源的时候，Response Header中缺少一项`Accept-Ranges: bytes`,经过[查询](http://www.cnblogs.com/lwhkdash/archive/2012/10/16/2726823.html)发现此标识表示该资源支持byte形式资源范围请求。


解决方案
==============================

继续查询Tomcat方向修改HTTP Response无果。于是回归到项目级别想办法，可以用Filter来解决。定义一个Filter拦截器，对以.MP4结尾的请求URI统一在HTTPResponse中添加Accept-Ranges

web.xml
--------------

{% highlight xml %}
<filter>
	<filter-name>mp4Filter</filter-name>
	<filter-class>com.freud.framework.adapter.filter.MP4Filter</filter-class>
	<init-param>
  		<param-name>AcceptRange</param-name>
  		<param-value>bytes</param-value>
	</init-param>
</filter>
<filter-mapping>
	<filter-name>mp4Filter</filter-name>
	<url-pattern>*.mp4</url-pattern>
</filter-mapping>
{% endhighlight %}


MP4Filter.java
--------------
{% highlight java %}
package com.freud.framework.adapter.filter;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletResponse;

public class MP4Filter implements Filter {

	private String acceptRange = "none";

	private static final String ACCEPT_RANGE = "AcceptRange";

	@Override
	public void destroy() {
	}

	@Override
	public void doFilter(ServletRequest req, ServletResponse res,
			FilterChain chain) throws IOException, ServletException {
		((HttpServletResponse) res).setHeader("Accept-Ranges", acceptRange);
		chain.doFilter(req, res);
	}

	@Override
	public void init(FilterConfig config) throws ServletException {
		String temp = config.getInitParameter(ACCEPT_RANGE);
		if (temp != null)
			acceptRange = temp;
	}
}
{% endhighlight %}

> 结果发现依旧不行，不过这个故事告诉我，买了一年的《HTTP协议详解》不能再蹭灰了，要好好看看啊，少年！要不就不至于这么被动了。


继续往下走，想起来在项目中使用的Spring MVC，而DispatcherServlet我配置的是`<url-pattern>/</url-pattern>`，所有静态文件都是走的Spring MVC的`<mvc:resources mapping="/resources/**" location="/resources/" />`，会不会是这个原因呢，于是自己重新写个最简单的Web项目。部署上去一看，我去，还真是。赶紧想办法。

![Success](/images/blog/html/01-html5-video/03-success.PNG)


解决方案就是在web.xml文件中添加如下配置，并且要写在DispatcherServlet的前面， 让defaultServlet先拦截，这个就不会进入Spring了。
{% highlight xml %}
<servlet-mapping>
	<servlet-name>default</servlet-name>
	<url-pattern>*.mp4</url-pattern>
</servlet-mapping>
{% endhighlight %}


附：

| Tomcat, Jetty, JBoss, and GlassFish  | 默认 Servlet的名字 -- "default" |
| Google App Engine | 默认 Servlet的名字 -- "_ah_default" |
| Resin | 默认 Servlet的名字 -- "resin-file" |
| WebLogic | 默认 Servlet的名字  -- "FileServlet" |
| WebSphere  | 默认 Servlet的名字 -- "SimpleFileServlet" |


> 至此，折腾了我几个星期的难题终于解决了。大功告成！总结下来算是第一次用HTML5的新特性，不熟悉，并且对Spring MVC的底层也没有那么深入，还有HTTP协议。最近几个月，有的书看了。恶补。


<br />
<br />
 
参考资料
====================

《dive into html5》: [http://diveintohtml5.info/video.html](http://diveintohtml5.info/video.html)


google 搜索镜像 ：[https://muzhiso.wallpai.com/#q=html5+video+iphone+not+working](https://muzhiso.wallpai.com/#q=html5+video+iphone+not+working)


videojs官网 ：[http://www.videojs.com/](http://www.videojs.com/)

 
videojs的BUG ：[https://github.com/videojs/video.js/issues/2945#event-500299257](https://github.com/videojs/video.js/issues/2945#event-500299257)


HTTP头域列表与解释 之 response篇 ： [http://www.cnblogs.com/lwhkdash/archive/2012/10/16/2726823.html](http://www.cnblogs.com/lwhkdash/archive/2012/10/16/2726823.html)


How to modify default tomcat http header property "Server: Apache-Coyote/1.1" : [http://grokbase.com/t/tomcat/users/082pbj1cb8/how-to-modify-default-tomcat-http-header-property-server-apache-coyote-1-1](http://grokbase.com/t/tomcat/users/082pbj1cb8/how-to-modify-default-tomcat-http-header-property-server-apache-coyote-1-1)


SpringMVC访问静态资源的三种方式 [http://blog.163.com/koko_qiang/blog/static/207213184201382091154584/](http://blog.163.com/koko_qiang/blog/static/207213184201382091154584/)

<br />
<br />











