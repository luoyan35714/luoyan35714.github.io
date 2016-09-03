---
layout: post
title:  JAVA OSGi教程(三)-Terminal下运行OSGI
date:   2014-12-18 15:51:01 +0800
categories: 技术文档
tag: OSGi
---

* content
{:toc}


1. 将上一章中的`osgi_equinox_activator`导出为jar包
- 在项目上右键`Export`->`Deployable plug-ins and fragments`
- `Directory`中选择指定的目录(本人的测试目录为`f:/test`), `Finish`
![Export](/images/blog/osgi/3_osgi_under_dos/01_export.png)
- 然后会在`f:/test/plugins/`目录下找到打包好的jar包（com.freud.osgi_1.0.0.201410261847.jar）

2. 打开'Terminal'。指向安装的'eclipse'所在目录的'plugins'目录

3. 运行`java –jar org.eclipse.osgi_$(version).jar –console`

![start](/images/blog/osgi/3_osgi_under_dos/02_start.png)

4. 使用`ss`命令查看当前加载的Bundle

![ss](/images/blog/osgi/3_osgi_under_dos/03_ss.png)

5. 使用`install file:f:\test\plugins\com.freud.osgi_1.0.0.201410281317.jar`命令加载我们自己的Bundle，并使用`ss`查看Bundle的安装情况

![install](/images/blog/osgi/3_osgi_under_dos/04_install.png)

6.	输入`start 1`和`stop 1`查看结果

![stop_start](/images/blog/osgi/3_osgi_under_dos/05_stop_start.png)

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