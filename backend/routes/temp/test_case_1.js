function test(x)
{
let total = 0
 for(let i =0; i<x.length; i++)
{
 total = total + x[i];
}
return total;
}
console.log(test([1,4,6]));