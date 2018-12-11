---
layout: post
title:  微服务架构下的测试之(三)-冒烟測試
date:   2018-12-10 09:58:00 +0800
categories: 技术文档
tag: 微服务
---

* content
{:toc}


冒烟測試（Smoke Test）
=============

冒烟測試（Smoke Test） ： 这一术语源自硬件行业。对一个硬件或硬件组件进行更改或修复后，直接给设备加电。如果没有冒烟，则该组件就通过了测试。在软件中，冒烟测试设计用于确认代码中的更改会按预期运行，且不会破坏整个版本的稳定性。

在微服務的架構下，我們可以使用冒烟測試來保證单个微服务在不依赖其他服务（其他服务在此处包含其他微服务或者其他的中间件）的前提下，其本身是正常运行的。


测试方案
=============

举个例子，我们有三个微服务，一个是Gateway， 一个是ServiceA， 一个是ServiceB，它们的调用关系如下图。 现在要上线的是ServiceA，我们需要保证的是在不依赖ServiceB的情况下，ServiceA可以正常启动，部署和运行。

![](/images/blog/micro-service/06-smoke-test/01-Smoke-Test.png)

针对冒烟测试可以搭配使用[MockMvc](https://docs.spring.io/spring/docs/current/spring-framework-reference/testing.html)和[WireMock](http://wiremock.org/)来实现。


项目代码
=============

还是拿之前的Product项目来说明，ProductService是维护商品信息的，其中的Controller层代码如下。

ProductController
-------------

{% highlight java %}
@RestController
@RequestMapping("/product")
public class ProductController {

	@Autowired
	private ProductService productService;

	@PostMapping("/all")
	public @ResponseBody List<Product> getProduct(@RequestBody List<Integer> productIds) {
		return productService.getProducts(productIds);
	}

}
{% endhighlight %}


测试代码
=============

那么我们就可以使用 [MockMVC](https://docs.spring.io/spring/docs/current/spring-framework-reference/testing.html) 对这个项目进行测试，如下

pom.xml
-------------

{% highlight xml %}
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-test</artifactId>
	<scope>test</scope>
</dependency>
<dependency>
	<groupId>com.github.tomakehurst</groupId>
	<artifactId>wiremock</artifactId>
	<version>2.1.12</version>
	<scope>test</scope>
</dependency>
{% endhighlight %}

ProductControllerTest.java
-------------

{% highlight java %}
package com.freud.test.product.ut.controller;

import java.util.ArrayList;
import java.util.List;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

import com.freud.test.product.bean.Product;
import com.freud.test.product.controller.ProductController;
import com.freud.test.product.service.ProductService;

@RunWith(MockitoJUnitRunner.class)
public class ProductControllerTest {

	@InjectMocks
	private ProductController productController;

	@Mock
	private ProductService productService;

	@Test
	public void testGetProduct() {

		List<Product> products = new ArrayList<Product>();
		Product p1 = new Product();
		p1.setId(1);
		p1.setName("Shoes");
		p1.setDescription("Beautiful shoes");
		p1.setStorage(10);
		products.add(p1);

		Product p2 = new Product();
		p2.setId(2);
		p2.setName("T-shirt");
		p2.setDescription("Cheap T-shirt");
		p2.setStorage(20);
		products.add(p2);
		Mockito.when(productService.getProducts(Mockito.any(List.class))).thenReturn(products);

		List<Integer> productIds = new ArrayList<>();
		productIds.add(new Integer(1));
		productIds.add(new Integer(2));

		List<Product> response = productController.getProduct(productIds);

		Assert.assertNotNull(response);
		Assert.assertEquals(2, response.size());
		Assert.assertEquals(new Integer(1), response.get(0).getId());
		Assert.assertEquals(new Integer(2), response.get(1).getId());
	}
}
{% endhighlight %}


完整代码
=============

请参照 GITHUB [ProductControllerTest.java](https://github.com/luoyan35714/TestInMicroServices/blob/master/ms-product/src/test/java/com/freud/test/product/ut/controller/ProductControllerTest.java)


參考資料
=============

单元测试 : [https://baike.baidu.com/item/%E5%8D%95%E5%85%83%E6%B5%8B%E8%AF%95](https://baike.baidu.com/item/%E5%8D%95%E5%85%83%E6%B5%8B%E8%AF%95)

MockMvc : [https://docs.spring.io/spring/docs/current/spring-framework-reference/testing.html](https://docs.spring.io/spring/docs/current/spring-framework-reference/testing.html)

WireMock : [http://wiremock.org/](http://wiremock.org/)