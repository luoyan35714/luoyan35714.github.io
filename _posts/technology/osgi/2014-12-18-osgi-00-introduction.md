---
layout: post
title:  JAVA OSGi教程(零)-OSGi简介
date:   2014-12-18 12:31:01 +0800
categories: 技术文档
tag: OSGi
---

* content
{:toc}


在java的SOA中可以分为两个阵营，解决了两个不同层级的问题，第一阵营算是WebService，解决了分布式系统级别SOA问题；第二阵营就是OSGi了，解决了jar级别的SOA问题。而今天要讲的就是OSGi。

* OSGi(Open Service Gateway Initiative)技术是面向Java的动态模型系统。OSGi服务平台提供一个通用、安全并且可管理的Java框架；它可以动态管理部署在框架内的Bundle，在不重启系统的情况下对Bundle进行安装和移除，而Java提供在多个平台支持产品的可移植性

* OSGi框架层次
	- 1 安全层Security Layer	
	- 2 模块层Module Layer
	- 3 生命周期层Life Cycle Layer
	- 4 服务层Service Layer

* 1 安全层
	- OSGi安全层是OSGi服务框架的一个可选的层。它基于Java 2 安全体系结构和jar签名机制，提供了对精密控制环境下的应用部署和管理的基础架构。

* 2 模块层
	- 2.1 Bundle
	- 2.2 Bundle描述文件
	- 2.3 Bundle类加载器
	- 2.4 Bundle国际化
	- 2.5 Fragment Bundle

* 2.1 Bundle
	* Bundle是一个框架定义的模块化单元，它包含模块运行时需要的class文件和资源文件，通过Manifest.MF文件组织起来
	* Bundle在OSGi框架中以jar的形式进行部署，Bundle也是框架中需要部署的唯一实体。
	![difference between jar and osgi](/images/blog/osgi/0_introduction/1_difference_between_OSGI-bundle_and_Jar.png)
	* 框架中的各个Bundle是物理隔离的，它们通过Export-Package、Import-Package和service的方式进行交互。

* 2.2 Bundle描述文件 - MANIFEST.MF
{% highlight c %}
#Bundle发行者的联系信息
Bundle-ContactAddress:
#Bundle的版权信息
Bundle-Copyright: Freud(c) 2014
#告警拓扑基础Bundle的描述信息
Bundle-Description: 
#Bundle文档的链接地址
Bundle-DocURL:http:/www.hifreud.com/
#描述Bundle的本地文件地址
Bundle-Localization: OSGI-INF/l10n/bundle
#定义了Bundle遵循的OSGi规范版本。默认值为1，表示R3的Bundle，2表示R4及其后发布的版本。
Bundle-ManifestVersion: 2
#基础工具定义了一个具有可读性的名字来标识Bundle。
Bundle-Name: 
#对Bundle中包含的本地代码库的规范
Bundle-NativeCode:/lib/runtime.dll;osname= Solaris; osversion = 8
#描述在服务平台的执行环境
Bundle-RequiredExecutionEnvironment:
# 提供了Bundle的一个全局的惟一的标志符，名称应该是基于反域名解析的。这个标记是必须的。
Bundle-SymbolicName: com.freud.osgi
#Bundle的更新地址
Bundle-UpdateLocation: 
#Bundle的发行者信息
Bundle-Vendor: 
#Export-Package和Import-Package描述了Bundle之间交互的一种主要方式；如果系统内不同版本的Bundle需要共存，版本标识是非常重要的。
Export-Package：com.freud.osgi.service;version=“2.0”
Import-Package：com.freud.osgi.service;version=“2.0”
{% endhighlight %}

* 2.3 Bundle类加载器
	* 每一个Bundle(除了Fragment Bundle)都有自己的类加载器，这种机制保证了Bundle间的物理隔离，也是OSGi动态加载能力的基础。

* 2.4 Bundle国际化
	* 采用标准的Java国际化方案，在Manifest文件中配置如下：
	* {% highlight text %}
	Bundle-Name=%bundleName
	{% endhighlight %}
	* 在OSGI-INF/l10n目录下建立bundle_zh_cn.properties文件：
	* {% highlight text %}
	bundleName=告警拓扑
	{% endhighlight %}

* 2.5 Fragment Bundle - 一种特殊的Bundle Fragment
	* Bundle片段，没有独立的类加载器，必须附属在其它的Bundle上，一个应用场景是使用它来更好的实现国际化。

* 3 生命周期层
	* 3.1 Bundle状态
	* 3.2 系统Bundle
	* 3.3 BundleContext
	* 3.4 Bundle事件

* 3.1 Bundle状态共有六种：
* {% highlight c %}
#Bundle已经成功的安装。
INSTALLED
#Bundle中所需要的类都已经可用，RESOLVED状态表明Bundle已经准备好了用于启动或者Bundle已被停止。
RESOLVED
#Bundle正在启动中，BundleActivator的start方法已经被调用，不过还没返回。BundleActivator是可选的，可以在其中初始化资源，启动线程。
STARTING
#Bundle已启动，并在运行中。
ACTIVE
#Bundle正在停止中，BundleActivator的stop方法已经被调用，不过还没返回。
STOPPING
#Bundle已经被卸载了。
UNINSTALLED
{% endhighlight %}


* 3.2 系统Bundle
	* 系统Bundle是一种特殊的Bundle，它的启动在任何其它的Bundle之前，并且不能被卸载（Uninstall），系统Bundle状态的变化会发出FrameworkEvent事件。系统Bundle也不能通过start命令进行启动。

* 3.3 BundleContext
	* BundleContext是框架和其它Bundle之间联系的一个纽带。
	* 每个Bundle启动的时候，框架会生成对应的BundleContext对象，通过BundleActivator的start方法传给对应的Bundle。
	* 在多个Bundle之间不能传递BundleContext。
	* 通过BundleContext，Bundle可以向框架注册自己提供的服务，获取其它Bundle提供的服务，监听其它Bundle的状态等。

* 3.4 Bundle事件
	* 在Bundle的状态发生变更时，框架会发出相应的事件，事件分为BundleEvent和FrameworkEvent，而对应的监听器也有两种：BundleListener和FrameworkListener。应用系统可以通过注册监听器来跟踪关心的事件，以在动态系统中表现出正确的行为。


* 4 服务层
	* 4.1 R3服务层
	* 4.2 声明式服务（Declarative Services）

* 4.1 R3服务层
	* 服务层提供服务的注册、查找定位、服务状态的监听等功能注册
	* 通过BundleContext的registerService方法进行服务的注册查找
	* 通过BundleContext的getServiceReference方法进行服务的查找状态监听
	* 通过BundleContext的addServiceListner方法注册ServiceListener，进行服务状态的监听服务的取消注册
	* 通过BundleContext的unregister方法进行服务的取消注册

* 4.2 声明式服务（Declarative Services）
	* DS是一个面向服务的组件模型，它制订的目的是更方便地在OSGi服务平台上发布、查找、绑定服务，对服务进行动态管理。对服务组件的描述采用XML来实现。
	* 在DS中，Component 可以是Service 的提供者和引用者，一个Component 可以提供0 至多个Service，也可以引用0 至多个Service，并且采用component 方式封装Service，方便了对Service 的复用。
	* 在DS中发布的服务的生命周期由OSG框架管理

* 5 启动级别服务
	* 在OSGi框架中可以定义Bundle的启动级别，启动级别是一个非负整数，值越小的启动级别越高，系统Bundle的启动级别为0

* 6 OSGi相关实现
	* [Felix](http://felix.apache.org/)：OSGi规范的标准实现，Apache项目
	* [Equinox](http://www.eclipse.org/equinox/)：在OSGI规范的基础上增加了扩展点的支持，该项目在Eclipse社区
	* [Spring DM](http://spring.io/projects)：Spring和OSGi的结合，在OSGi规范的基础上构建，支持Felix和Equinox。与OSGi的DS是互补的，同时Spring中的其它特性均可以在OSGi中使用

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
<br />
百度文库:《[OSGi](http://wenku.baidu.com/link?url=qXGnTGaAYk__uLiPohhnQpfyR-yWsyW88GFmyREDf4EyHiFd1dulfX8-7K698euO98UryZKd2QPEMbtVoX--5IRRA-QVFrDvy6kh49e4sBy)》