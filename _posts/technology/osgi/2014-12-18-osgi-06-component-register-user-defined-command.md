---
layout: post
title:  JAVA OSGi教程(六)-component注册自定义控制台命令实现
date:   2014-12-20 23:20:01 +0800
categories: 技术文档
tag: OSGi
---

* content
{:toc}


* 在`第五章`的基础上，将`OSGi_equinox_consumer`项目下的`META-INF/MANIFEST.MF`文件中的`Bundle-Activator`项删除
* 在`MANIFEST.MF`中添加`org.eclipse.osgi.framework.console` Bundle的支持

![mainefest file configuration](/images/blog/osgi/6-component-register-user-defined-command/1_mf_file_configuration.png)

* 在`com.freud.osgi.consumer`目录下新建一个`PracticeService`的类，内容为

{% highlight java %}
package com.freud.osgi.consumer;

import org.eclipse.osgi.framework.console.CommandInterpreter;
import org.eclipse.osgi.framework.console.CommandProvider;

import com.freud.osgi.HelloWorldService;

public class PracticeService implements CommandProvider {

	private HelloWorldService helloWorldService;

	public void _say(CommandInterpreter ci) {
		ci.println(helloWorldService.sayHello(ci.nextArgument()));
	}

	public synchronized void unsetHelloWorldService() {
		this.helloWorldService = null;
	}

	public synchronized void setHelloWorldService(
			HelloWorldService helloWorldService) {
		if (this.helloWorldService != helloWorldService) {
			this.helloWorldService = helloWorldService;
		}
	}

	@Override
	public String getHelp() {
		String ret = "pring the help info for <say>";
		System.out.println(ret);
		return ret;
	}

}
{% endhighlight %}

* 在项目下新建一个文件夹`OSGI-INF`
* 在`osgi-INF`目录`右键`，新建一个`Component Definition`，修改Class为`om.freud.osgi.consumer.PracticeService`

![new component definition](/images/blog/osgi/6-component-register-user-defined-command/2_new_component_definition.png)

* 打开`component`文件，切到`Services`的tab下，在`Referenced Services`上Add添加一个新的`Reference Service`为`“HelloWorldService”`,然后点击`Edit`编辑如下内容
* 在`Provided Services`中点击Add添加`org.eclipse.osgi.framework.console.CommandProvider`
* 上两步的`截图`如下

![services configuration](/images/blog/osgi/6-component-register-user-defined-command/3_services_configuration.png)

* 重新`运行`
* 在控制台中尝试输入`say freud`

![say freud](/images/blog/osgi/6-component-register-user-defined-command/4_say_freud.png)

* 在控制台输入`services *HelloWorldService`, 输出为这个Service的Bundle`使用状态`。
* 在控制台中尝试输入`say freud`

![bundle use service](/images/blog/osgi/6-component-register-user-defined-command/5_bundle_use_service.png)

* 在控制台输入`help say`输出say的`Helper info`

![helper info](/images/blog/osgi/6-component-register-user-defined-command/6_helper_info.png)

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