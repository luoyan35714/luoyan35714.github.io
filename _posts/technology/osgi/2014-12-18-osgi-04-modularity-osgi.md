---
layout: post
title:  JAVA OSGi教程(四)-模块化的OSGI
date:   2014-12-18 22:50:01 +0800
categories: 技术文档
tag: OSGi
---

* content
{:toc}


* 新建一个`plug-in project`,命名为`osgi_equinox_provider`

![new provider project](/images/blog/osgi/4_modularity_osgi/01_new_provider_project.png)

* 在`com.freud.osgi`包下新建一个`HelloWorldService`的接口

{% highlight java %}
package com.freud.osgi;

public interface HelloWorldService {

	String sayHello(String name);
}
{% endhighlight %}

* 新建一个`plug-in project`，命名为`osgi_equinox_impl`

![new implement project](/images/blog/osgi/4_modularity_osgi/02_new_impl_project.png)

* 修改`META-INF`下的文件`MANIFEST.MF`，在`import-package`上添加`com.freud.osgi`

![import package](/images/blog/osgi/4_modularity_osgi/03_import_package.png)

* 在`com.freud.osgi.impl`下添加一个类`HelloWorldServiceImpl`，内容为

{% highlight java %}
package com.freud.osgi.impl;

import com.freud.osgi.HelloWorldService;

public class HelloWorldServiceImpl implements HelloWorldService {

	@Override
	public String sayHello(String name) {
		String ret = "Hello " + name;
		System.out.println(ret);
		return ret;
	}

}
{% endhighlight %}

* 在`com.freud.osgi.impl`下修改`Activator`类为如下内容

{% highlight java %}
package com.freud.osgi.impl;

import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;

import com.freud.osgi.HelloWorldService;

public class Activator implements BundleActivator {

	private static BundleContext context;

	static BundleContext getContext() {
		return context;
	}

	public void start(BundleContext bundleContext) throws Exception {
		Activator.context = bundleContext;
		context.registerService(HelloWorldService.class,
				new HelloWorldServiceImpl(), null);
	}

	public void stop(BundleContext bundleContext) throws Exception {
		context.ungetService(context
				.getServiceReference(HelloWorldService.class));
		Activator.context = null;
	}
}
{% endhighlight %}

* 新建一个`plug-in project`,命名为`osgi_equinox_consumer`

![new consumer project](/images/blog/osgi/4_modularity_osgi/04_new_consumer_project.png)

* 修改`META-INF`目录下的`MANIFEST.MF`文件为

![import consumer package](/images/blog/osgi/4_modularity_osgi/05_import_consumer_package.png)

* 修改`com.freud.osgi.consumer`目录下的`Activator`文件内容为

{% highlight java %}
package com.freud.osgi.consumer;

import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceReference;

import com.freud.osgi.HelloWorldService;

public class Activator implements BundleActivator {

	private static BundleContext context;

	static BundleContext getContext() {
		return context;
	}

	public void start(BundleContext bundleContext) throws Exception {
		Activator.context = bundleContext;
		ServiceReference<HelloWorldService> serviceReference = context.getServiceReference(HelloWorldService.class);
		
		HelloWorldService service = context.getService(serviceReference);
		
		service.sayHello("world from equinox consumer---");
	}

	public void stop(BundleContext bundleContext) throws Exception {
		Activator.context = null;
	}

}
{% endhighlight %}

* 在`osgi_equinox_provider`项目上`右键`->`run as`->`Run configurations-new OSGi FrameWork`

![run configuration](/images/blog/osgi/4_modularity_osgi/06_run_configure.png)

* 得出的控制台`输出`如下              

![ss stdout](/images/blog/osgi/4_modularity_osgi/07_ss_stout.png)

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