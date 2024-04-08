/*
    await asyncForEach(ARRAY, async (item) => {
      const result = await fetchApi(...)
    })
*/

export default async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}


