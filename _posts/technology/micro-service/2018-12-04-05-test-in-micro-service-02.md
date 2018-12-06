---
layout: post
title:  微服务架构下的测试之(二)-单元测试
date:   2018-12-05 20:05:00 +0800
categories: 技术文档
tag: 微服务
---

* content
{:toc}


单元测试（Unit Test）
=============

单元测试（Unit Test）是指对软件中的最小可测试单元进行检查和验证。在java中,单元指一个类。 -- 此处摘录自百度

> 在Java中，笔者更认可单元指的是方法，我们针对方法进行测试而不是类。

测试方案
=============

在微服务中的单元测试跟常规项目的单元测试是一样的。

举个例子，我们有ClassA，在ClassA中有三个方法，分别是methodA, methodB, methodC。那我们的测试方案就是针对ClassA创建一个ClassATest类，并在类中针对每个方法的多个场景进行测试，并且尽量考虑正常情况和异常情况，包括各种临界值的场景。如下图。

![](/images/blog/micro-service/05-unit-test/01-UT.png)


项目代码
=============

比如我们有一个Product项目，是维护商品信息的，其中的Controller层代码如下。

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

那么我们就可以使用 [Mockito](https://site.mockito.org/) 对这个Controller进行单元测试，如下

pom.xml
-------------

{% highlight xml %}
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-test</artifactId>
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
