---
layout: 	post
title:  	Tomcat下部署HTTPs并且配置HTTP重定向到HTTPs
date:   	2018-08-04 22:58:00 +0800
categories: 杂乱
tag: 		tomcat
---

* content
{:toc}


Tomcat下部署HTTPs
======================

生成Keystore和cer文件
----------------------

如果需要认证过的CA应该到相关的机构去购买，[阿里云](https://www.aliyun.com/)提供了相关的服务。由于本处做测试使用，所以使用keytool自己生成。

{% highlight bash %}
Freud'MacBook-Pro:github freud$ keytool -genkeypair -alias tomcat_cert -keyalg RSA -validity 36500 -storepass tomcat_cert -keystore tomcat_cert.keystore -v
您的名字与姓氏是什么?
  [Unknown]:  Freud
您的组织单位名称是什么?
  [Unknown]:  Byedao
您的组织名称是什么?
  [Unknown]:  Byedao.info
您所在的城市或区域名称是什么?
  [Unknown]:  Dalian
您所在的省/市/自治区名称是什么?
  [Unknown]:  Liaoning
该单位的双字母国家/地区代码是什么?
  [Unknown]:  CN 
CN=Freud, OU=Byedao, O=Byedao.info, L=Dalian, ST=Liaoning, C=CN是否正确?
  [否]:  y

正在为以下对象生成 2,048 位RSA密钥对和自签名证书 (SHA256withRSA) (有效期为 36,500 天):
	 CN=Freud, OU=Byedao, O=Byedao.info, L=Dalian, ST=Liaoning, C=CN
输入 <tomcat_cert> 的密钥口令
	(如果和密钥库口令相同, 按回车):  tomcat_cert
再次输入新口令: tomcat_cert
[正在存储tomcat_cert.keystore]
Freud'MacBook-Pro:github freud$ keytool -exportcert -alias tomcat_cert -file tomcat_cert.cer -storepass tomcat_cert -keystore tomcat_cert.keystore -v
存储在文件 <tomcat_cert.cer> 中的证书
Freud'MacBook-Pro:github freud$ ls -la
total 32
drwxr-xr-x  12 freud  staff   408  8  4 23:08 .
drwxr-xr-x   7 freud  staff   238  6 21 16:34 ..
-rw-r--r--   1 freud  staff   885  8  4 23:08 tomcat_cert.keystore
-rw-r--r--   1 freud  staff  2243  8  4 23:07 tomcat_cert.keystore
{% endhighlight %}

命令执行完会在路径下生成两个文件，`tomcat_cert.keystore`和`tomcat_cert.keystore`

配置HTTPs访问
----------------------

修改Tomcat下的conf/server.xml,修改如下内容:

{% highlight xml %}
 <!-- 修改前
<Connector port="8443" protocol="org.apache.coyote.http11.Http11Protocol"
   maxThreads="150" SSLEnabled="true" scheme="https" secure="true"
   clientAuth="false" sslProtocol="TLS" />
-->
<!-- 修改前 -->
<Connector port="443" protocol="org.apache.coyote.http11.Http11Protocol"
   maxThreads="150" SSLEnabled="true" scheme="https" secure="true"
   clientAuth="false" sslProtocol="TLS" 
   keystoreFile="some_location\tomcat_cert.keystore"
   keystorePass="tomcat_cert"/>
{% endhighlight %}


配置HTTP重定向到HTTPs
======================

为了彻底支持HTTPs，所以决定所有请求到HTTP的请求都应该重定向到HTTPs的路径。需要做如下配置

将8080端口改为80，8443改为443
----------------------

{% highlight xml %}
<!-- 修改前 -->
<Connector port="8080" protocol="HTTP/1.1"
   connectionTimeout="20000"
   redirectPort="8443" />
<!-- 修改前 -->
<Connector port="80" protocol="HTTP/1.1"
   connectionTimeout="20000"
   redirectPort="443" />
{% endhighlight %}

将8009处的8443改为443
----------------------

{% highlight xml %}
<!-- 修改前 -->
<Connector port="8009" protocol="AJP/1.3" redirectPort="8443" />
<!-- 修改前 -->
<Connector port="8009" protocol="AJP/1.3" redirectPort="443" />
{% endhighlight %}

修改conf/web.xml
----------------------
在web.xml最后</web>之前加上如下内容

{% highlight xml %}
<security-constraint>
  <web-resource-collection >
    <web-resource-name >SSL</web-resource-name>
    <url-pattern>/*</url-pattern>
  </web-resource-collection>
  <user-data-constraint>
    <transport-guarantee>CONFIDENTIAL</transport-guarantee>
  </user-data-constraint>
</security-constraint>
{% endhighlight %}


验证
======================

重启服务并分别访问`http://localhost/`和`https://localhost/`进行验证HTTPs和HTTP重定向是否生效：

{% highlight xml %}
./bin/startup.sh
{% highlight xml %}










