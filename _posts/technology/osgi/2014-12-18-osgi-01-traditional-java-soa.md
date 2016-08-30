---
layout: post
title:  JAVA OSGi教程(一)-传统的java模块化
date:   2014-12-18 13:31:01 +0800
categories: 技术文档
tag: OSGi
---

* content
{:toc}


- 创建一个新的`java project`，命名为`ServiceProvider`

- 在`com.freud.service`包下创建一个新的`interface`，命名为`HelloWorldService`
{% highlight java %}
package com.freud.service;

public interface HelloWorldService {

	public void sayHello(String name);
}
{% endhighlight %}

- 在`com.freud.service.impl`包下创建一个新的`java`类，命名为`HelloWorldServiceImpl`
{% highlight java %}
package com.freud.service.impl;

import com.freud.service.HelloWorldService;

public class HelloWorldServiceImpl implements HelloWorldService {

	@Override
	public void sayHello(String name) {
		System.out.println("Hello," + name);

	}

}
{% endhighlight %}

- 在`src`下新建一个`Folder`，命名为`META-INF`，并在`META-INF`下创建一个`folder`命名为`services`，一个文件命名为`MANIFEST.MF`
{% highlight java %}
Manifest-Version: 1.0
{% endhighlight %}

- 在`services`目录下创建一个文件命名为`com.freud.service.HelloWorldService`
其中的内容为：
{% highlight text %}
com.freud.service.impl.HelloWorldServiceImpl
{% endhighlight %}

- 将项目导出为`jar`到一个本地目录，命名为`ServiceProvider.jar`

- 新建一个`Java Project`，命名为`ServiceConsumer`,并添加`ServiceProvider.jar`为外部`jar`依赖

- 在`com.freud.service.test`目录下添加一个测试类`HelloWorldTest`
{% highlight java %}
package com.freud.service.test;

import java.util.Iterator;
import java.util.ServiceLoader;

import com.freud.service.HelloWorldService;

public class HelloWorldTest {

	public static void main(String[] args) {

		ServiceLoader<HelloWorldService> serviceLoader = ServiceLoader
				.load(HelloWorldService.class);

		Iterator<HelloWorldService> ite = serviceLoader.iterator();

		while (ite.hasNext()) {
			ite.next().sayHello("World");
		}

	}
}
{% endhighlight %}

- 执行测试类

|总结|当Consumer类调用HelloWorldService的时候，并不需要去关注在Provider中的服务具体实现是什么，而是只需要去关注Service的接口就可以了，对接口的实现在Provider中。|
|缺点|实现类在打包发布之后，还是暴露给了Consumer，而这对Consumer来说，是完全没有用的东西。|

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