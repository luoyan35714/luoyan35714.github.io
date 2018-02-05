---
layout: post
title:  加密算法学习笔记(六) - 非对称加密算法
date:   2018-02-05 09:20:00 +0800
categories: 技术文档
tag: 加密算法
---

* content
{:toc}


非对称加密算法
=================================

公钥和私钥，在非对称加密算法中，有的算法支持公钥加密私钥解密，有的算法支持私钥加密公钥解密，有的这两种算法都支持。

+ DH(Diffie-Hellman) - 密钥交换算法
+ RSA - 基于因子分解
+ ElGamal - 基于离散对数
+ ECC(Elliptical Curve Cryptography) - 椭圆曲线加密


DH(Diffie-Hellman) - 密钥交换算法
=================================

| 密钥长度 			| 默认 	| 工作方式 	| 填充方式 	| 实现方	|
| 512-1024(64倍数)	| 1024 	| 无			| 无			| JDK 	|


 
![/images/blog/encryption/05-symmetric-encryption/01-DES-introduction.png](/images/blog/encryption/05-symmetric-encryption/01-DES-introduction.png)

{% highlight java %}
{% endhighlight %}

![/images/blog/encryption/05-symmetric-encryption/02-DES-FLOW.png](/images/blog/encryption/05-symmetric-encryption/02-DES-FLOW.png)




参考资料
===========================

[Java实现消息摘要算法加密](http://www.imooc.com/learn/286?src=sugc)

PBETest : [https://fossies.org/linux/envelopes-sourceonly/thirdparty/bouncycastle-135-customized/test/src/org/bouncycastle/jce/provider/test/PBETest.java](https://fossies.org/linux/envelopes-sourceonly/thirdparty/bouncycastle-135-customized/test/src/org/bouncycastle/jce/provider/test/PBETest.java)
