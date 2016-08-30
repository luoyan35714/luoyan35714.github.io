---
layout: post
title:  算法-每周一算法之(一) - 冒泡排序
date:   2015-02-03 15:09:00 +0800
categories: 技术文档
tag: 算法
---

* content
{:toc}


冒泡排序（名字由来是因为越大的元素会经由交换慢慢“浮”到数列的顶端）
--------------------------------------------------------
![冒泡Logo](/images/blog/algorithm/sort/bubble/1-bobble-logo.png)

![冒泡过程](/images/blog/algorithm/sort/bubble/2-bubble-introduct.png)

算法原理
--------------------------------------------------------
冒泡排序算法的运作如下：（从后往前）

* 比较相邻的元素。如果第一个比第二个大，就交换他们两个。
* 对每一对相邻元素作同样的工作，从开始第一对到结尾的最后一对。在这一点，最后的元素应该会是最大的数。
* 针对所有的元素重复以上的步骤，除了最后一个。
* 持续每次对越来越少的元素重复上面的步骤，直到没有任何一对数字需要比较

Java实现
--------------------------------------------------------
{% highlight java %}
import java.util.Arrays;

/**
 * @author Freud
 * @site http://www.hifreud.com/
 * @email luoyan35714@126.com
 */
public class TestBubble {

	private static int[] array = { 9, 3, 5, 2, 6, 1, 4, 8, 6 };

	public static void bubble() {

		for (int i = array.length; i > 0; i--) {
			for (int j = 0; j < i - 1; j++) {
				if (array[j] > array[j + 1]) {
					array[j] = array[j] + array[j + 1];
					array[j + 1] = array[j] - array[j + 1];
					array[j] = array[j] - array[j + 1];
				}
			}
		}
	}

	public static void main(String[] args) {
		System.out.print("冒泡排序之前：");
		System.out.println(Arrays.toString(array));
		bubble();
		System.out.print("冒泡排序之后：");
		System.out.println(Arrays.toString(array));
	}
}
{% endhighlight %}

复杂度计算
--------------------------------------------------------
时间复杂度：冒泡的算法已经决定了比较次数是固定的n(n-1)，而移动次数由顺序决定，最大为n(n-1)，最小为0，平均为n(n-1)，所以冒泡的时间复杂度为n*n


引申思考
--------------------------------------------------------
* 经典的冒泡是每次将最大的放在数组的末端，而逆向思考之后，最小的放在顶端的方式也是一种实现
* 经典的冒泡是每次比较相邻两个数的大小，而既然每次循环已经知道了数组最后要比较的位置，那拿第N位与每趟的最后一位比较，大的就放在后面，也是一种解决方案。
* 引申出来的这三种（第二种也可以正序+反序）跟经典的冒泡在时间，空间复杂度，比较次数和移动次数上是一致的。
* 不过好像以上思考有种茴香豆的茴有几种写法的嫌疑~哈哈，不要做孔乙己。

参考资料
--------------------------------------------------------

[冒泡排序-百度百科](http://baike.baidu.com/link?url=-JWNZUYVK3QYiMyvvw3MjszFGeFGsFnv-5cfGZ1MTHBH9e820JuqvHJirY1AipnNN8bYJZ0ng3fBf4iiOYgOpa)

[冒泡排序-百度经验](http://jingyan.baidu.com/article/6525d4b13f920bac7d2e9484.html)