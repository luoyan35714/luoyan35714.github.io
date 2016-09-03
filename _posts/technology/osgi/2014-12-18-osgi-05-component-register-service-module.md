---
layout: post
title:  JAVA OSGi教程(五)-Component注册Service模块实现
date:   2014-12-19 00:12:01 +0800
categories: 技术文档
tag: OSGi
---

* content
{:toc}


* 在`第四章`的基础上，在`osgi_equinox_impl`项目中的`META-INF`目录下的`MANIFEST.MF`文件中删除Bundle-Activator: `com.freud.osgi.impl.Activator`
* 在项目上新建一个文件夹`osgi-INF`
* 在`OSGi-INF`上，右键新建一个`Component Definition`,注意在Class上填写`com.freud.osgi.impl.HelloWorldServiceImpl`

![new component definition](/images/blog/osgi/5_component_register_service/01_new_component_definition.png)

* 打开`component`文件，切到`Services tab`下，修改如下

![provide services](/images/blog/osgi/5_component_register_service/02_provide_services.png)

* 重新`Run as`-`Run configuration`

![run configuration](/images/blog/osgi/5_component_register_service/03_run_configuration.png)

* 控制台`输出`为                      

![ss stdout](/images/blog/osgi/5_component_register_service/04_ss_stdout.png)

<br/>

>其中有个小插曲是直接运行会报一个no service的错误，只需要先把consumer取消掉运行成功一次，停止程序，然后再将Consumer添加上再运行就可以成功了。

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