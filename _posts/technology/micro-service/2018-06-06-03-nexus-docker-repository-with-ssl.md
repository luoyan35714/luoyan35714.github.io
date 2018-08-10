---
layout: post
title:  微服务--使用HTTPS在Nexus Repository Manager 3.0上搭建私有Docker仓库
date:   2018-06-06 17:38:00 +0800
categories: 技术文档
tag: 微服务
---

* content
{:toc}


搭建方式
=============

搭建SSL的Nexus官方提供两种方式

+ 第一种是反向代理服务器，Nexus Repository Manager使用HTTP对外提供服务，然后使用Nginx之类的反向代理服务器对外提供HTTPS服务，但是反向代理服务器与Nexus Repository Manager之间依旧使用HTTP交互。
+ 第二种就是比较正常的，在Nexus Repository Manager上做一些配置，使得Nexus Repository Manager直接对外提供HTTPS服务。

本文主要描述的就是第二种方式


配置HTTPS
=============

生成keystore文件
-------------

在项目的`$install-dir/etc/ssl/`目录下，执行命令

{% highlight bash %}
#{NEXUS_DOMAIN} = nexus为服务器域名
#{NEXUS_IP} = 192.168.59.1 为服务器IP
$ cd $install-dir/etc/ssl/
$ keytool -genkeypair -keystore keystore.jks -storepass nexus3 -keypass nexus3 -alias jetty -keyalg RSA -keysize 2048 -validity 5000 -dname "CN=*.{NEXUS_DOMAIN}, OU=Example, O=Sonatype, L=Unspecified, ST=Unspecified, C=US" -ext "SAN=DNS:{NEXUS_DOMAIN},IP:{NEXUS_IP}" -ext "BC=ca:true"
{% endhighlight %}

添加SSL端口
-------------

修改`$data-dir/etc/nexus.properties`文件，在第一行添加`application-port-ssl=8443`

添加HTTPS支持配置文件
-------------

修改`$data-dir/etc/nexus.properties`文件，修改Key为`nexus-args`所在行的值，在后面添加`,${jetty.etc}/jetty-https.xml,${jetty.etc}/jetty-http-redirect-to-https.xml`

{% highlight bash %}
nexus-args=${jetty.etc}/jetty.xml,${jetty.etc}/jetty-http.xml,${jetty.etc}/jetty-requestlog.xml,${jetty.etc}/jetty-https.xml,${jetty.etc}/jetty-http-redirect-to-https.xml
{% endhighlight %}

修改HTTPS配置文件
-------------

修改`${jetty.etc}/jetty-https.xml`文件中keystore和truststore的配置部分

{% highlight xml %}
<Set name="KeyStorePath"><Property name="ssl.etc"/>/keystore.jks</Set>
<Set name="KeyStorePassword">nexus3</Set>
<Set name="KeyManagerPassword">nexus3</Set>
<Set name="TrustStorePath"><Property name="ssl.etc"/>/keystore.jks</Set>
<Set name="TrustStorePassword">nexus3</Set>
{% endhighlight %}

验证
=============

重新启动服务
-------------

{% highlight bash %}
$nexus.exe /run
{% endhighlight %}

Web访问
-------------

可以访问`http://localhost:8081/`或者`https://localhost:8443/`来查看，如果能够正常打开网页则配置成功。此处由于配置了`jetty-http-redirect-to-https.xml`，所以在访问http的时候会自动redirect到https地址。


docker配置
=============

登录报错
-------------

{% highlight bash %}
[root@localhost docker]# docker login -u admin -p admin123 192.168.59.1:8551
Error response from daemon: Get https://192.168.59.1:8551/v1/users/: x509: certificate signed by unknown authority
{% endhighlight %}

> 此处有个小插曲就是之前是报错如下`Error response from daemon: Get https://192.168.59.1:8551/v1/users/: x509: cannot validate certificate for 192.168.59.1 because it doesn't contain any IP SANs`这是因为在生成keystore的时候没有指定IP

此处有两种方式解决上述问题，第一种是添加insecure-registries,不对SSL进行认证校验，第二种是安装签名证书，进行校验。

1-修改daemon.json文件
-------------

{% highlight bash %}
[root@localhost docker]# vi /etc/docker/daemon.json
{
  "insecure-registries": [
    "192.168.59.1:8551"
  ],
  "disable-legacy-registry": true
}
[root@localhost docker]# docker login -u admin -p admin123 192.168.59.1:8551
Login Succeeded
{% endhighlight %}

2-配置ca-trust（centos）
-------------

{% highlight bash %}
[root@localhost docker]# docker login -u admin -p admin123 192.168.59.1:8551
Error response from daemon: Get https://192.168.59.1:8551/v2/: x509: certificate has expired or is not yet valid
{% endhighlight %}

出现上述问题，搜索之后大多数人说是服务器时间不同步问题，解决如下：

{% highlight bash %}
# 先解决时区问题
[root@localhost ~]# ls -l /etc/localtime 
lrwxrwxrwx. 1 root root 38 Apr 25 07:09 /etc/localtime -> ../usr/share/zoneinfo/America/New_York
[root@localhost ~]# rm -f /etc/localtime
[root@localhost ~]# ln -s /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
# 在解决时间问题
[root@localhost docker]# yum install ntp.x86_64
# 可用的ntp服务器列表 http://www.ntp.org.cn/pool.php
[root@localhost docker]# ntpdate cn.ntp.org.cn
6 Jun 17:50:20 ntpdate[18252]: no server suitable for synchronization found
# 由于公司代理服务器问题，连接不上NTP服务器，所以手动设置
[root@localhost ~]# date -s 20180606
Wed Jun  6 00:00:00 CST 2018
[root@localhost ~]# date -s 17:53:35
Wed Jun  6 17:53:35 CST 2018
{% endhighlight %}

基于centos7.0版本，生成和导入cert文件

{% highlight bash %}
#生成cert文件
[root@localhost ~]# keytool -printcert -sslserver 192.168.59.1:8443 -rfc >nexus.crt
[root@localhost ~]# yum install ca-certificates
[root@localhost ~]# update-ca-trust force-enable
# 还可以放在/etc/docker/certs.d/192.168.59.1:8443目录下
[root@localhost ~]# mv nexus.crt /etc/pki/ca-trust/source/anchors/nexus.crt
[root@localhost ~]# update-ca-trust
[root@localhost ~]# service docker restart
[root@localhost ~]# docker login -u admin -p admin123 192.168.59.1:8551
Error response from daemon: Get https://192.168.59.1:8551/v2/: x509: certificate signed by unknown authority
{% endhighlight %}

对于Ubuntu系统来说certificate的存放路径是`/usr/local/share/ca-certificates`

{% highlight bash %}
#生成cert文件
[root@localhost ~]# keytool -printcert -sslserver 192.168.59.1:8443 -rfc >nexus.crt
# 还可以放在/etc/docker/certs.d/192.168.59.1:8443目录下
[root@localhost ~]# mv nexus.crt /usr/local/share/ca-certificates/nexus.crt
[root@localhost ~]# update-ca-certificates
[root@localhost ~]# service docker restart
[root@localhost ~]# docker login -u admin -p admin123 192.168.59.1:8551
{% endhighlight %}

依然报错如上，说是Unkonw authority，搜索之后发现` 一般情况下，证书只支持域名访问，要使其支持IP地址访问,需要修改配置文件openssl.cnf。`

在Redhat7系统中，文件所在位置是/etc/pki/tls/openssl.cnf。在其中的[ v3_ca]部分，添加subjectAltName选项：

{% highlight bash %}
[ v3_ca ]  
subjectAltName = IP:192.168.59.1
{% endhighlight %}

再次执行`docker login`

{% highlight bash %}
[root@localhost ~]# service docker restart
[root@localhost ~]# docker login -u admin -p admin123 192.168.59.1:8551
Login Succeeded
{% endhighlight %}

至此，大功告成！


參考資料
=============

SSL and Repository Connector Configuration : [https://help.sonatype.com/repomanager3/private-registry-for-docker/ssl-and-repository-connector-configuration](https://help.sonatype.com/repomanager3/private-registry-for-docker/ssl-and-repository-connector-configuration)

Inbound SSL - Configuring to Serve Content via HTTPS : [https://help.sonatype.com/repomanager3/security/configuring-ssl#ConfiguringSSL-InboundSSL-ConfiguringtoServeContentviaHTTPS](https://help.sonatype.com/repomanager3/security/configuring-ssl#ConfiguringSSL-InboundSSL-ConfiguringtoServeContentviaHTTPS)

Using Self-Signed Certificates with Nexus Repository Manager and Docker Daemon [https://support.sonatype.com/hc/en-us/articles/217542177-Using-Self-Signed-Certificates-with-Nexus-Repository-Manager-and-Docker-Daemon](https://support.sonatype.com/hc/en-us/articles/217542177-Using-Self-Signed-Certificates-with-Nexus-Repository-Manager-and-Docker-Daemon)

ca证书校验用户证书 : [https://www.cnblogs.com/cmsd/p/6078705.html](https://www.cnblogs.com/cmsd/p/6078705.html)

03搭建docker私有仓库 : [https://blog.csdn.net/gqtcgq/article/details/51163558](https://blog.csdn.net/gqtcgq/article/details/51163558)

docker 报错：x509 : certificate has expired or is not yet valid: [https://blog.csdn.net/bjbs_270/article/details/48784807](https://blog.csdn.net/bjbs_270/article/details/48784807)

linux设置系统时间 : [https://www.cnblogs.com/boshen-hzb/p/6269378.html](https://www.cnblogs.com/boshen-hzb/p/6269378.html)