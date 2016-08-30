---
layout: post
title:  fastdb-学习笔记(四)-查询语言
date:   2014-12-24 12:42:01 +0800
category : 技术文档
tag : fastdb
---

* content
{:toc}


自[FastDB Main Memory Database Management System](http://www.garret.ru/fastdb/FastDB.htm#sql)
=================================

fastdb支持一个类sql句法的查询语言。fastdb使用更流行于面向对象程序设计的表达式而不是关系数据库的表达式。表中的行被认为是对象实例，表是这些对象的一个类。与sql不同，fastdb面向的是对对象的操作而不是对sql元组。所以每一次查询的结果就是来自一个类的对象的集合。fastdb查询语言与标准sql的主要差别在于：

* 不支持多个表之间的连接（join）操作，不支持嵌套子查询。查询总是返回来自一个表的对象的集合。

* 原子表列使用标准的c数据类型。

* 没有NULL值，只有null引用。我完全同意C.J.Date对3值逻辑的批评以及他使用缺省值来代替NULL的意图。

* 结构和数组可以作为记录元素。一个特别的exists算子(quantor)用来定位数组中的元素。

* 可以为表记录（对象）也可以为记录元素定义无参用户自定义方法。

* 应用程序可以定义只有一个串或者数值类型参数的用户自定义函数。

* 支持对象间的引用，包括自动支持逆引用。

* 通过使用引用，start from follow by执行递归的记录遍历。

* 因为查询语言深度继承在了c++类中，语言标识符和关键字是大小写敏感的

* 不进行整形和浮点型到串的隐含转换，如果需要这样的转换，必须显式进行。

下面类BNF表达式的规则指定了Fastdb查询语言搜索断言的语法：

![Grammar conventions](/images/blog/fastdb/4-query-language/1_Grammar_conventions.png)

{% highlight c %}
select-condition ::= ( expression ) ( traverse ) ( order )
expression ::= disjunction
disjunction ::= conjunction 
        | conjunction or disjunction
conjunction ::= comparison 
        | comparison and conjunction
comparison ::= operand = operand 
        | operand != operand 
        | operand <> operand 
        | operand < operand 
        | operand <= operand 
        | operand > operand 
        | operand >= operand 
        | operand (not) like operand 
        | operand (not) like operand escape string
        | operand (not) match operand
        | operand (not) in operand
        | operand (not) in expressions-list
        | operand (not) between operand and operand
	| operand is (not) null
operand ::= addition
additions ::= multiplication 
        | addition +  multiplication
        | addition || multiplication
        | addition -  multiplication
multiplication ::= power 
        | multiplication * power
        | multiplication / power
power ::= term
        | term ^ power
term ::= identifier | number | string 
        | true | false | null 
	| current | first | last
	| ( expression ) 
        | not comparison
	| - term
	| term [ expression ] 
	| identifier . term 
	| function term
        | exists identifier : term
function ::= abs | length | lower | upper
        | integer | real | string | user-function
string ::= ' { { any-character-except-quote } ('') } '
expressions-list ::= ( expression { , expression } )
order ::= order by sort-list
sort-list ::= field-order { , field-order }
field-order ::= [length] field (asc | desc)
field ::= identifier { . identifier }
traverse ::= start from field ( follow by fields-list )
fields-list ::=  field { , field }
user-function ::= identifier
{% endhighlight %}

标识符大小写敏感，必须以一个a-z，A-Z ，_ 或者$字符开头，只包含a-z, A-Z,0-9,_或者$字符，不能使用SQL保留字。保留字列表

| abs | and | asc | between | by |
| current | desc | escape | exists | false |
| first | follow | from | in | integer |
| is | length | like | last | lower |
| match | not | null | or | real |
| start | string | true | upper |

可以使用ANSI标准注释，所有位于双连字符后直到行末的字符都将被忽略掉。

fastdb扩展了ansi标准sql操作符，支持位运算。and/of操作符不仅可以运用到布尔操作数也可以操作整形操作书。and/or运用到整形操作数返回的结果是一个整形值，这个值是对操作数进行按位and或者按位or得到的结果。对于小的集合位运算是高效的。fastdb也支持对整形和浮点型的升幂运算（x^y）

Structures
=================================

结构可以作为记录的组成部分，结构的字段可以通过标准的点表达式访问：company.address.city

结构字段可以以指定的顺序索引和使用，可以嵌套并且嵌套的层次没有限制。程序员可以定义结构的方法用于查询。该方法不能有参数并且只能返回原子类型（布尔值、数值、字符串和引用类型）。这些方法也不能改变对象句柄。如果该方法返回字符串，这个字符串应当使用new 运算符分配，因为其值拷贝后串就会被删掉。

用户定义方法可以用来创建虚组件-就是不存储在数据库中由别的组件计算出来的组件。例如，mdb dbDateTime 类型只包括一个整型的时间戳组件以及如dbDateTime::year(),dbDateTime::month()之类的方法，可以在应用中指定像这样的查询："delivery.year = 1999"，

Arrays
=================================

FastDB组件接受动态数组长度，不支持多维数组，但是在arrays中定义array是可以的。这使得通过数组域的长度来排序成为可能。FastDB提供了一系列的特殊构造器来处理Arrays:

* 1 It is possible to get the number of elements in the array by the length() function.
* 2 Array elements can be fetched by the[] operator. If an index expression is out of array range, an exception will be raised.
* 3 The operator in can be used to check if an array contains a value specified by the left operand. This operation can be used only for arrays of atomic type: with boolean, numeric, reference or string components.
* 4 Array can be updated using update method which creates copy of the array and returns non-constant reference.
* 5 Iteration through array elements is performed by the exists operator. A variable specified after the exists keyword can be used as an index in arrays in the expression preceeded by the exists quantor. This index variable will iterate through all possible array index values, until the value of the expression will become true or the index runs out of range. The condition

{% highlight c %}
exists i: (contract[i].company.location = 'US')
{% endhighlight %}

will select all details which are shipped by companies located in 'US', while the query

{% highlight c %}
not exists i: (contract[i].company.location = 'US')
{% endhighlight %}

will select all details which are shipped from companies outside 'US'.
Nested exists clauses are allowed. Using nested exists quantors is equivalent to nested loops using the correspondent index variables. For example the query

{% highlight c %}
exists column: (exists row: (matrix[column][row] = 0))
{% endhighlight %}

will select all records, containing 0 in elements of a matrix field, which has type array of array of integer. This construction is equivalent to the following two nested loops:

{% highlight c %}
bool result = false;
for (int column = 0; column < matrix.length(); column++) { 
    for (int row = 0; row < matrix[column].length(); row++) { 
         if (matrix[column][row] == 0) { 
             result = true;
             break;
         }
    }
}
{% endhighlight %}

The order of using indices is essential! The result of the following query execution
{% highlight c %}
exists row: (exists column: (matrix[column][row] = 0))
{% endhighlight %}
will be completely different from the result of the previous query. In the last case, the program simply hangs due to an infinite loop in case of empty matrices.

Strings
=================================

All strings in FastDB have varying length and the programmer should not worry about specification of maximal length for character fields. All operations acceptable for arrays are also applicable to strings. In addition to them, strings have a set of own operations. First of all, strings can be compared with each other using standard relation operators. At present, FastDB supports only the ASCII character set (corresponds to type char in C) and byte-by-byte comparison of strings ignoring locality settings.

The operator like can be used for matching a string with a pattern containing special wildcard characters '%' and '_'. The character '_' matches any single character, while the character '%' matches zero or more characters. An extended form of the like operator together with the escape keyword can be used to handle the characters '%' and '_' in the pattern as normal characters if they are preceded by a special escape character, specified after the escape keyword.

If you rebuild GigaBASE with USE_REGEX macro, then you can use match operator implementing standard regular expressions (based on GNU regex library). Second operand of this operator specified regular expression to be matched and should be string literal.

It is possible to search substrings within a string by the in operator. The expression ('blue' in color) will be true for all records which color field contains 'blue'. If the length of the searched string is greater than some threshold value (currently 512), a Boyer-Moore substring search algorithm is used instead of a straightforward search implementation.

Strings can be concatenated by + or || operators. The last one was added for compatibility with the ANSI SQL standard. As far as FastDB doesn't support the implicit conversion to string type in expressions, the semantic of the operator + can be redefined for strings.

References
=================================

References can be dereferenced using the same dot notation as used for accessing structure components. For example the following query

{% highlight c %}
company.address.city = 'Chicago'
{% endhighlight %}

will access records referenced by the company component of a Contract record and extract the city component of the address field of the referenced record from the Supplier table.
References can be checked for null by is null or is not null predicates. Also references can be compared for equality with each other as well as with the special null keyword. When a null reference is dereferenced, an exception is raised by FastDB.

There is a special keyword current, which during a table search can be used to refer to the current record. Usually , the current keyword is used for comparison of the current record identifier with other references or locating it within an array of references. For example, the following query will search in the Contract table for all active contracts (assuming that the field canceledContracts has a dbArray< dbReference<Contract> > type):

{% highlight c %}
current not in supplier.canceledContracts
{% endhighlight %}

FastDB provides special operators for recursive traverse of records by references:

{% highlight c %}
start from root-references
( follow by list-of-reference-fields )
{% endhighlight %}
The first part of this construction is used to specify root objects. The nonterminal root-references should be a variable of reference or of array of reference type. The two special keywords first and last can be used here, locating the first/last record in the table correspondingly. If you want to check all records referenced by an array of references or a single reference field for some condition, then this construction can be used without the follow by part.
If you specify the follow by part, then FastDB will recursively traverse the table of records, starting from the root references and using a list-of-reference-fields for transition between records. The list-of-reference-fields should consist of fields of reference or of array of reference type. The traverse is done in depth first top-left-right order (first we visit the parent node and then the siblings in left-to-right order). The recursion terminates when a null reference is accessed or an already visited record is referenced. For example the following query will search a tree of records with weight larger than 1 in TLR order:

{% highlight c %}
"weight > 1 start from first follow by left, right"
{% endhighlight %}

For the following tree:

{% highlight c %}
                      A:1.1
      B:2.0                             C:1.5
D:1.3         E:1.8                F:1.2         G:0.8
{% endhighlight %}

the result of the query execution will be:

{% highlight c %}
('A', 1.1), ('B', 2.0), ('D', 1.3), ('E', 1.8), ('C', 1.5), ('F', 1.2)
{% endhighlight %}

As was already mentioned FastDB always manipulates with objects and doesn't accept joins. Joins can be implemented using references. Consider the classical Supplier-Shipment-Detail examples:

{% highlight c %}
struct Detail { 
    char const* name;
    double      weight;
    
    TYPE_DESCRIPTOR((KEY(name, INDEXED), FIELD(weight)));
};

struct Supplier { 
    char const* company;
    char const* address;

    TYPE_DESCRIPTOR((KEY(company, INDEXED), FIELD(address)));
};

struct Shipment { 
    dbReference<Detail>   detail;
    dbReference<Supplier> supplier;
    int4                  price;
    int4                  quantity;
    dbDateTime            delivery;

    TYPE_DESCRIPTOR((KEY(detail, HASHED), KEY(supplier, HASHED), 
                     FIELD(price), FIELD(quantity), FIELD(delivery)));
};
{% endhighlight %}

We want to get information about delivery of some concrete details from some concrete suppliers. In relational database this query will be written something like this:
{% highlight sql %}
select from Supplier,Shipment,Detail where 
         Supplier.SID = Shipment.SID and Shipment.DID = Detail.DID 
         and Supplier.company like ? and Supplier.address like ?
         and Detail.name like ? 
{% endhighlight %}

In FastDB this request should be written as:

{% highlight sql %}
dbQuery q = "detail.name like",name,"and supplier.company like",company,
         "and supplier.address like",address,"order by price";
{% endhighlight %}

FastDB will first perform index search in the table Detail for details matching the search condition. Then it performs another index search to locate shipment records referencing selected details. Then sequential search is used to check the rest of select predicate.

Functions
=================================

FastDB允许用户自行定义函数和运算符，函数至少需要一个参数，但不能超过3 个。参数类型必须为string、integer、boolean、reference 或者用户定义类型（rawbinary）

<br>
<br>

参考资料
=================================

fastdb主页 : [http://www.garret.ru/fastdb.html](http://www.garret.ru/fastdb.html)

FastDB SourceForge主页 : [http://sourceforge.net/projects/fastdb](http://sourceforge.net/projects/fastdb)

FastDB SourceForge下载 :

[http://sourceforge.net/projects/fastdb/files/latest/download](http://sourceforge.net/projects/fastdb/files/latest/download)

参考博客 ：

[http://blog.csdn.net/fuyun10036/article/details/8620542](http://blog.csdn.net/fuyun10036/article/details/8620542)