---
layout: post
title:  JAVA OSGi教程(七)-基于Activator编码的OSGi实现WEB项目
date:   2014-12-21 00:04:01 +0800
categories: 技术文档
tag: OSGi
---

* content
{:toc}


* 新建一个Plug-in Project，命名为OSGi_equinox_web
* 下一步，在接下来的页面输入如下内容，然后finish

![new project](/images/blog/osgi/7-activator-code-osgi-WEB/01_new_project.png)

* 在META-INF/MANIFEST.MF文件中修改如下（红色标记部分为添加内容）

![edit manifest](/images/blog/osgi/7-activator-code-osgi-WEB/02_edit_manifest.png)

* 在com.freud.osgi.web下新建一个类HelloWorldServlet，内容如下

{% highlight java %}
package com.freud.osgi.web;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class HelloWorldServlet extends HttpServlet {
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		resp.getWriter().write("Hello World - 1st version!");
	}
}
{% endhighlight %}

* 修改com.freud.osgi.web包下的Activator文件内容为如下

{% highlight java %}
package com.freud.osgi.web;

import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;
import org.osgi.service.http.HttpService;

public class Activator implements BundleActivator {

	private static BundleContext context;

	private HttpService httpService;

	static BundleContext getContext() {
		return context;
	}

	public void start(BundleContext bundleContext) throws Exception {
		Activator.context = bundleContext;

		httpService = context.getService(context
				.getServiceReference(HttpService.class));

		httpService.registerServlet("/hello", new HelloWorldServlet(), null,
				null);
	}

	public void stop(BundleContext bundleContext) throws Exception {
		httpService.unregister("/hello");
		Activator.context = null;
	}

}
{% endhighlight %}

* 运行：在项目上右键 - Run as -> Run configuration
* 在OSGi Framework上右键new，配置如下

![run configuration](/images/blog/osgi/7-activator-code-osgi-WEB/03_run_configuration.png)

* 运行成功之后，控制台输如ss查看结果如下

![ss stdout](/images/blog/osgi/7-activator-code-osgi-WEB/04_ss_stdout.png)

* 打开一个浏览器，在地址栏输入[http://localhost/hello](http://localhost/hello),转到，结果为

![run configuration](/images/blog/osgi/7-activator-code-osgi-WEB/05_web_browser_view.png)

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