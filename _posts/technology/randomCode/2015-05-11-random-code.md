---
layout: post
title:  随机验证码 - JSP生成和验证随机码
date:   2015-05-11 15:48:00 +0800
categories: 技术文档
tag: 随机验证码
---

* content
{:toc}


文件清单
================================

{% highlight text %}
ImageServlet.java
web.xml
image.jsp
result.jsp
{% endhighlight %}

ImageServlet.java
================================

{% highlight java %}
package com.freud.test;

import java.awt.Color;
import java.awt.Graphics;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.Random;

import javax.imageio.ImageIO;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * 图片获取和验证Servlet
 * 
 * @author Freud
 * @version 1.0.0 - Date : 2015-05-11
 *
 */
public class ImageServlet extends HttpServlet {

	private static final long serialVersionUID = -5424418247489994690L;
	private static final int WIDTH = 68;
	private static final int HEIGHT = 22;

	/**
	 * GET方式获取随机码图片
	 */
	@Override
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		BufferedImage bi = new BufferedImage(WIDTH, HEIGHT,
				BufferedImage.TYPE_INT_RGB);

		Graphics g = bi.createGraphics();
		Color color = new Color(200, 150, 255);
		g.setColor(color);
		g.fillRect(0, 0, WIDTH, HEIGHT);

		char[] ch = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".toCharArray();

		Random r = new Random();

		int len = ch.length, index;

		/** 设置4位随机验证码 */
		StringBuffer sb = new StringBuffer();
		for (int i = 0; i < 4; i++) {
			index = r.nextInt(len);
			sb.append(ch[index]);
			g.setColor(new Color(r.nextInt(88), r.nextInt(255), r.nextInt(255)));
			g.drawString(ch[index] + "", (i * 15) + 3, 18);
		}

		System.out.println("获取图形验证码【" + sb.toString() + "】");
		request.getSession().setAttribute("randomStr", sb.toString());

		// 设置响应类型,输出图片客户端不缓存
		response.setDateHeader("Expires", 1L);
		response.setHeader("Cache-Control", "no-cache, no-store, max-age=0");
		response.addHeader("Pragma", "no-cache");
		response.setContentType("image/jpeg");

		ImageIO.write(bi, "jpg", response.getOutputStream());

	}

	/**
	 * POST方式验证随机码
	 */
	@Override
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		String randomCode = request.getParameter("randomCode");
		String existCode = (String) request.getSession().getAttribute(
				"randomStr");

		String ret = "您输入的[" + randomCode + "]和图片显示的[" + existCode + "]";
		if (randomCode.equals(existCode)) {
			System.out.println("通过验证 - " + ret);
			request.setAttribute("result", "通过验证 - " + ret);
		} else {
			System.out.println("未通过验证 - " + ret);
			request.setAttribute("result", "未通过验证 - " + ret);
		}

		request.getRequestDispatcher("/result.jsp").forward(request, response);
	}
}
{% endhighlight %}

web.xml
================================

{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns="http://java.sun.com/xml/ns/javaee"
	xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd"
	version="2.5">

	<servlet>
		<servlet-name>image</servlet-name>
		<servlet-class>com.freud.test.ImageServlet</servlet-class>
	</servlet>

	<servlet-mapping>
		<servlet-name>image</servlet-name>
		<url-pattern>/servlet/image</url-pattern>
	</servlet-mapping>

</web-app>
{% endhighlight %}

image.jsp
================================

{% highlight html %}
<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<title>随机验证码测试</title>
	</head>
<body>

	<form action="${pageContext.request.contextPath}/servlet/image" method="post">
		<label>请输入验证码</label>
		<input type="text" name="randomCode">
		<img id="randomImage" alt="随机验证码" src="${pageContext.request.contextPath}/servlet/image">
		<a href="javascript:refreshImageCode()">刷新</a>
		<input type="submit" value="验证">
	</form>
	<script type="text/javascript">
		function refreshImageCode(){
			/*
			 * 重新获取验证码，并使用动态地址规避浏览器对同一路径下GET请求的图片缓存功能
			 */
			document.getElementById("randomImage").src = "${pageContext.request.contextPath}/servlet/image?_="+new Date();
		}
	</script>
</body>
</html>
{% endhighlight %}

result.jsp
================================

{% highlight html %}
<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<title>验证结果</title>
	</head>
	<body>
		<label>${result }</label>
		<a href="${pageContext.request.contextPath}/image.jsp">back</a>
	</body>
</html>
{% endhighlight %}

测试
================================

在地址栏中输入`http://localhost:8080/TestRandomImage/image.jsp`，效果如下
![验证码输入界面](/images/blog/randomCode/jsp_image_code_index.png)
!输入验证码`FGJR`之后，通过验证如下：
![验证成功](/images/blog/randomCode/jsp_image_code_validate_pass.png)
输入错误验证码之后，验证失败如下：
![失败](/images/blog/randomCode/jsp_image_code_validate_fail.png)

其他框架
================================

* jcaptcha
* kaptcha

<br />
<br />