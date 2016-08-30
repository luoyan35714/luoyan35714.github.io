---
layout: post
title:  fastdb-学习笔记(八)-查询优化
date:   2014-12-24 13:10:00 +0800
category : 技术文档
tag : fastdb
---

* content
{:toc}


The execution of queries, when all data is present in memory, is very fast, compared with the time for query execution in a traditional RDBMS. But FastDB even more increases the speed for query execution by applying several optimizations: using indices, inverse references and query parallelization. The following sections supply more information about these optimizations.

Using indices in queries
=================================

Indices are a traditional approach for increasing RDBMS performance. FastDB uses two types of indices: extensible hash table and T-tree. The first type provides the fastest way (with constant time in average) to access a record with a specified value of the key. Whereas the T-tree, which is acombination of AVL-Tree and array, has the same role for a MMRDBMS as the B-Tree for a traditional RDBMS. It provides search, insertion and deletion operations with guaranteed logarithmic complexity (i.e. the time for performing a search/insert/delete operation for a table with N records is C*log2(N), where C is some constant). The T-tree is more suitable for a MMDBMS than a B-Tree, because the last one tries to minimize the number of page loads (which is an expensive operation in disk-based databases), while the T-tree tries to optimize the number of compare/move operations. The T-tree is the best type to use with range operations or when the order of records is significant.

FastDB uses simple rules for applying indices, allowing a programmer to predict when an index and which one will be used. The check for index applicability is done during each query execution, so the decision can be made depending on the values of the operands. The following rules describe the algorithm of applying indices by FastDB:

* The compiled condition expression is always inspected from left to right.
* If the topmost expression is AND then try to apply an index to the left part of the expression, using the right part as a filter.
* If the topmost expression is OR and an index can be applied to the left part of the expression, then apply the index and test the right part for the possibility to use indices.
* Otherwise, an index is applicable to the expression, when
	* the topmost expression is a relational operation (= < > <= >= between like)
	* the type of operands is boolean, numeric, string or reference
	* the right operand(s) of the expression is either a constant literal or a C++ variable, and
	* the left part is an indexed field of the record
	* the index is compatible with a relational operation

Now we should make clear what the phrase "index is compatible with operation" means and which type of index is used in each case. A hash table can be used when:

* a comparison for equality = is used.
* a between operation is used and the values of both bounds operands are the same.
* a like operation is used and the pattern string contains no special characters ('%' or '_') and no escape characters (specified in an escape part).

A T-tree index can be applied if a hash table is not applicable (or a field is not hashed) and:

* a comparison operation (= < > <= >= between) is used.
* a like operation is used and the pattern string contains no empty prefix (i.e. the first character of the pattern is not '%' or '_').

If an index is used to search the prefix of a like expression, and the suffix is not just the '%' character, then an index search operation can return more records than really match the pattern. In this case we should filter the index search output by applying a pattern match operation.

When the search condition is a disjunction of several subexpressions (the expression contains several alternatives combined by the or operator), then several indices can be used for the query execution. To avoid record duplicates in this case, a bitmap is used in the cursor to mark records already selected.

If the search condition requires a sequential table scan, the T-tree index still can be used if the order by clause contains the single record field for which the T-tree index is defined. As far as sorting is very expensive an operation, using an index instead of sorting significantly reduces the time for the query execution.

It is possible to check which indices are used for the query execution, and a number of probes can be done during index search, by compiling FastDB with the option -DDEBUG=DEBUG_TRACE. In this case, FastDB will dump trace information about database functionality including information about indices.

Inverse references
=================================

Inverse references provide an efficient and reliable way to establish relations between tables. FastDB uses information about inverse references when a record is inserted/updated/deleted and also for query optimization. Relations between records can be of one of the following types: one-to-one, one-to-many and many-to-many.

* A one-to-one relation is represented by a reference field in the self and the target record.
* A one-to-many relation is represented by a reference field in the self record and an array of references field in the record of the target table.
* A many-to-one relation is represented by an array of references field in the self record and a reference field in the record of the referenced table.
* A many-to-many relation is represented by an array of references field in the self and in the target record.

When a record with declared relations is inserted in the table, the inverse references in all tables, which are in relation with this record, are updated to point to this record. When a record is updated and a field specifying the record's relationship is changed, then the inverse references are also reconstructed automatically by removing references to the updated record from those records which are no longer in relation with the updated record and by setting inverse references to the updated record for new records included in the relation. When a record is deleted from the table, references to it are removed from all inverse reference fields.

Due to efficiency reasons, FastDB is not able to guarantee the consistency of all references. If you remove a record from the table, there still can be references to the removed record in the database. Accessing these references can cause unpredictable behavior of the application and even database corruption. Using inverse references allows to eliminate this problem, because all references will be updated automatically and the consistency of references is preserved.

Let's use the following table definitions as an example:

{% highlight C++ %}
class Contract;

class Detail { 
  public:
    char const* name;
    char const* material;
    char const* color;
    real4       weight;

    dbArray< dbReference<Contract> > contracts;

    TYPE_DESCRIPTOR((KEY(name, INDEXED|HASHED), 
		     KEY(material, HASHED), 
		     KEY(color, HASHED),
		     KEY(weight, INDEXED),
		     RELATION(contracts, detail)));
};

class Supplier { 
  public:
    char const* company;
    char const* location;
    bool        foreign;

    dbArray< dbReference<Contract> > contracts;

    TYPE_DESCRIPTOR((KEY(company, INDEXED|HASHED), 
		     KEY(location, HASHED), 
		     FIELD(foreign),
		     RELATION(contracts, supplier)));
};


class Contract { 
  public:
    dbDateTime            delivery;
    int4                  quantity;
    int8                  price;
    dbReference<Detail>   detail;
    dbReference<Supplier> supplier;

    TYPE_DESCRIPTOR((KEY(delivery, HASHED|INDEXED), 
		     KEY(quantity, INDEXED), 
		     KEY(price, INDEXED),
		     RELATION(detail, contracts),
		     RELATION(supplier, contracts)));
};
{% endhighlight%}

In this example there are one-to-many relations between the tables Detail-Contract and Supplier-Contract. When a Contract record is inserted in the database, it is necessary only to set the references detail and supplier to the correspondent records of the Detail and the Supplier table. The inverse references contracts in these records will be updated automatically. The same happens when a Contract record is removed: references to the removed record will be automatically excluded from the contracts field of the referenced Detail and Supplier records.

Moreover, using inverse reference allows to choose more effective plans for query execution. Consider the following query, selecting all details shipped by some company:

{% highlight C++ %}
q = "exists i:(contracts[i].supplier.company=",company,")";
{% endhighlight%}

The straightforward approach to execute this query is scanning the Detail table and testing each record for this condition. But using inverse references we can choose another approach: perform an index search in the Supplier table for records with the specified company name and then use the inverse references to locate records from the Detail table, which are in transitive relation with the selected supplier records. Certainly we should eliminate duplicates of records, which can appear because the company can ship a number of different details. This is done by a bitmap in the cursor object. As far as index search is significantly faster than sequential search and accessing records by reference is very fast an operation, the total time of such query execution is much shorter compared with the straightforward approach.

Starting from 1.20 version FastDB supports cascade deletes. If field is declared using OWNER macro, the record is treated as owner of the hierarchical relation. When the owner records is removed all members of this relation (records referenced from the owner) will be automatically removed. If member record of the relation should contain reference to the owner record, this field should be declared using RELATION macro.

Realtime issues
=================================

FastDB is not a true realtime system, because it is based on non-realtime operating systems (like NT or Unix), which mostly doesn't fit realtime requirements. But with some restrictions it is possible to give quite precise estimations for query execution time in FastDB. Such restrictions include:

* The whole database is in the physical memory and no swapping can take place during application work.
* Other applications should not consume much CPU time and system resources (especially memory), to minimize the influence on the main application.
* The required time of reaction is significantly longer than the quantum of processes rescheduling in the operating system.

Algorithms used in FastDB allow to quite precisely calculate the average and maximal time of query execution depending on the number of records in the table (assuming that the size of array fields in records is significantly smaller than the table size; and the time of iteration through array elements can be excluded from the estimation). The following table shows the complexity of searching a table with N records depending on the search condition:

| Type of search | Average | Maximal |
| Sequential search | O(N) | O(N) |
| Sequential search with sorting | O(N*log(N)) | O(N*log(N)) |
| Search using hash table | O(1) | O(N) |
| Search using T-tree | O(log(N)) | O(log(N)) |
| Access by reference | O(1) | O(1) |

FastDB uses the Heapsort algorithm for sorting selected records to provide guaranteed log(N) complexity (quicksort is on the average a little bit faster, but worst time is O(N*N)). A hash table also has different average and maximal complexity. On the average, a hash table search is faster than a T-tree search, but in the worst case it is equivalent to a sequential search while a T-tree search always guarantees log(N) complexity.

The execution of update statements in FastDB is also fast, but this time is less predictable, because the commit operation requires flushing of modified pages to disk which can cause unpredictable operating system delays.

Parallel query execution
=================================

FastDB is able to split a query into several parallel jobs, which will be executed without any contention with each other. Parallelization of a query is done by FastDB only for sequential scans of the table. In this case, splitting jobs between N processors can reduce the query execution time about N times (even more if the result shall be sorted).
To split a table scan, FastDB starts N threads, each of them tests N-s records of the table (i.e. thread number 0 tests records 0,N,2*N,... thread number 1 test records 1,1+N,1+2*N,... and so on). Each thread builds its own list of selected records. After termination of all threads, these lists are concatenated to construct the single result list.

If the result shall be sorted, then each thread, after finishing the table scan, sorts the records it selected. After termination of all threads, their lists are merged (as it is done with an external sort).

Parallel query execution is controlled by two parameters: the number of spawned threads and a parallel search threshold. The first is specified in the dbDatabase class constructor or set by the dbDatabase::setConcurrency method. A zero value of this parameter asks FastDB to automatically detect the number of online CPUs in the system and spawns exactly this number of threads. By default, the number of threads is set to 1, so no parallel query execution takes place.

The parallel search threshold parameter specifies the minimal number of records in the table for which parallelization of the query can improve query performance (starting a thread has its own overhead). This parameter is a static component of the dbDatabase class and can be changed by an application at any moment of time.

Parallel query execution is not possible when:

* Indices are used for query execution.
* The number of records in the table is less than dbDatabase::dbParallelScanThreshold.
* A selection limit is set for the cursor.
* The query includes a start from part.

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