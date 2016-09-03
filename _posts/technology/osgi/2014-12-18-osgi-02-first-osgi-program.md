---
layout: post
title:  JAVA OSGi教程(二)-第一个OSGI程序
date:   2014-12-18 15:43:00 +0800
categories: 技术文档
tag: OSGi
---

* content
{:toc}


- 新建一个`Plug-in Project`，命名为`osgi_equinox_activator`, 并在`OSGI framework`中选中`standard`，如下图                  

![create a new project](/images/blog/osgi/2_first_osgi/01_new_project.png)

- 下一步：
{% highlight text %}
ID： com.freud.osgi
Version: 1.0.0.qualifier
Name: Osgi_equinox_activator
{% endhighlight %}
- 勾选`Generate an activator`, `a Java class that controls the plug-in’s life cycle`
`Activator`: `com.freud.osgi.activator.Activator`
如下图

![configue_project](/images/blog/osgi/2_first_osgi/02_configue_project.png)

- 下一步，取消对`Create a plug-in using one of the templates`的`Check`，并且`Finish`
- 修改`com.freud.osgi.activator.Activator`内容为
{% highlight java %}
package com.freud.osgi.activator;

import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;

public class Activator implements BundleActivator {

	private static BundleContext context;

	static BundleContext getContext() {
		return context;
	}

	public void start(BundleContext bundleContext) throws Exception {
		System.out.println("[freud]Bundle started!");
	}

	public void stop(BundleContext bundleContext) throws Exception {
		System.out.println("[freud]Bundle stoped!");
	}

}
{% endhighlight %}

- 运行，在`Project`上右键`run as` -> `Run Configurations`
- 在弹出的对话框中，选择`OSGi Framework`，然后右键 -> `new`
在新建的`Configuration`中做如下配置

![before_run](/images/blog/osgi/2_first_osgi/03_before_run.png)

- `Apply` 并`Run`，将会在控制台中输出如下

![console_out_started](/images/blog/osgi/2_first_osgi/04_console_out_started.png)

- 在控制台中输入`ss`可以看到所有被加载的Bundles

![console_out_ss](/images/blog/osgi/2_first_osgi/05_console_out_ss.png)

- 输入`stop ${id}`可以停止已加载的Bundle，例如stop 3就可以停止我们自己刚刚写的Bundle

![console_out_stop](/images/blog/osgi/2_first_osgi/06_console_out_stop.png)

- 输入`start ${id}`可以启动Bundle，例如start 3就可以重新启动我们刚刚写的Bundle

![console_out_restart](/images/blog/osgi/2_first_osgi/07_console_out_restart.png)

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