---
layout: post
title:  Spring MVC使用笔记 - (一)文件上传
date:   2015-02-25 14:20:00 +0800
categories: 技术文档
tag: Spring
---

* content
{:toc}


web.xml
==========================
{% highlight xml %}
<listener>
<listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
</listener>
<servlet>
<servlet-name>web-app</servlet-name>
<servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
<init-param>
  <param-name>contextConfigLocation</param-name>
  <param-value>/WEB-INF/web-app-servlet.xml</param-value>
</init-param>
<load-on-startup>1</load-on-startup>
</servlet>
<servlet-mapping>
<servlet-name>web-app</servlet-name>
<url-pattern>/</url-pattern>
</servlet-mapping>
{% endhighlight %}


web-app-servlet.xml
==========================
{% highlight xml %}
<bean
	class="org.springframework.web.servlet.view.InternalResourceViewResolver"
	p:viewClass="org.springframework.web.servlet.view.JstlView" 
	p:prefix="/WEB-INF/jsp/"
	p:suffix=".jsp" />

<bean id="multipartResolver"
	class="org.springframework.web.multipart.commons.CommonsMultipartResolver">
	<!-- 限制上传文件大小,单位byte -->
	<property name="maxUploadSize" value="1024000000"></property>
</bean>
{% endhighlight %}


controller类中的实现
==========================
{% highlight java %}
@RequestMapping(value = "/upload")
public String upload(HttpServletRequest request, String parameter)
    throws Exception
{
    /** 检验传入参数。 */
    System.out.println(parameter);
    
    MultipartHttpServletRequest multipartRequest = (MultipartHttpServletRequest)request;
    SimpleDateFormat dateformat = new SimpleDateFormat("yyyy-MM-dd");
    /** 构建图片保存的目录 **/
    String logoPathDir = "/resources/img/" + dateformat.format(new Date());
    /** 得到图片保存目录的真实路径 **/
    String logoRealPathDir = request.getSession().getServletContext().getRealPath(logoPathDir);
    /** 根据真实路径创建目录 **/
    File logoSaveFile = new File(logoRealPathDir);
    if (!logoSaveFile.exists())
        logoSaveFile.mkdirs();
    /** 页面控件的文件流 **/
    MultipartFile multipartFile = multipartRequest.getFile("file");
    
    // 构建非重复文件名称
    String logImageName = UUID.randomUUID().toString() + "." + multipartFile.getOriginalFilename();
    
    /** 拼成完整的文件保存路径加文件 **/
    String fileName = logoRealPathDir + File.separator + logImageName;
    
    File file = new File(fileName);
    
    multipartFile.transferTo(file);
    
    return "success";
    
}
{% endhighlight %}


测试
------------------------
> 测试方法有两种，第一种是通过JSP构建HTML，用户手动上传，第二种是通过程序动态上传。


第一种:测试用JSP为upload.jsp
==========================
{% highlight html %}
<form action="/common/upload" method="post" enctype="multipart/form-data">  
         <input type="hidden" name="parameter" value="hifreud"/>  
         <input type="file" name="file"/>
         <input type="submit" value="upload"/>
</form>
{% endhighlight %}


第二种:测试用程序动态控制
==========================
{% highlight java %}
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class Test {

	public static void main(String[] args) {

		try {

			// Could be any string
			String boundary = "Boundary-b1ed-4060-99b9-fca7ff59c113";

			String Enter = "\r\n";

			File xml = new File("E:\\test.jpg");
			FileInputStream fis = new FileInputStream(xml);

			URL url = new URL("http://localhost:8080/file_test/common/upload");

			HttpURLConnection conn = (HttpURLConnection) url.openConnection();

			conn.setDoOutput(true);
			conn.setDoInput(true);
			conn.setRequestMethod("POST");
			conn.setUseCaches(false);
			conn.setInstanceFollowRedirects(true);
			conn.setRequestProperty("Content-Type",
					"multipart/form-data;boundary=" + boundary);

			conn.connect();

			DataOutputStream dos = new DataOutputStream(conn.getOutputStream());

			// part 1
			String part1 = "--" + boundary + Enter
					+ "Content-Type: application/octet-stream" + Enter
					+ "Content-Disposition: form-data; filename=\""
					+ xml.getName() + "\"; name=\"file\"" + Enter + Enter;

			// part 2
			String part2 = Enter + "--" + boundary + Enter
					+ "Content-Type: text/plain" + Enter
					+ "Content-Disposition: form-data; name=\"parameter\""
					+ Enter + Enter + "hifreud" + Enter + "--" + boundary
					+ "--";

			byte[] xmlBytes = new byte[fis.available()];
			fis.read(xmlBytes);

			dos.writeBytes(part1);
			dos.write(xmlBytes);
			dos.writeBytes(part2);

			dos.flush();
			dos.close();
			fis.close();

			System.out.println("status code: " + conn.getResponseCode());

			conn.disconnect();

		} catch (Exception e) {
			e.printStackTrace();
		}

	}
}
{% endhighlight %}


参考资料
======================

[springMVC 注解方式实现全程+文件上传](http://blog.csdn.net/sundenskyqq/article/details/6799038)

[java 发送文件（Http Post），带其他参数](http://blog.csdn.net/zhouyingge1104/article/details/28267827)