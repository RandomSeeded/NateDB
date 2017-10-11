'use strict';

const executor = require('./executor');

// const testProjection = [
//   ["PROJECTION", ["title"]],
//   // ["DISTINCT", []],
//   ["SORT", ["title"]],
//   // ["LIMIT", ["10"]],
//   ["SELECTION", ["title", "LESS_THAN", "N"]],
//   ["SELECTION", ["title", "GREATER_THAN", "M"]],
//   ["FILESCAN", ["movies"]]
// ];
// const schema = ['movie_id', 'title', 'genres'];

// const testProjection = [
//   ["AVERAGE", []],
//   // ["DISTINCT", []],
//   // ["SORT", ["rating"]],
//   ["PROJECTION", ["rating"]],
//   ["SELECTION", ["movieId", "EQUALS", "5000"]],
//   ["LIMIT", ["500000"]],
//   ["FILESCAN", ["ratings"]]
// ];
// const schema = ['userId', 'movieId', 'rating', 'timestamp'];

// ```
// -> Average
//   -> Projection(lambda r: r.ratings_rating)
//     -> NestedLoopsJoin(lambda r, s: r.id == s.movie_id)
//       -> Selection(lambda r: r.name == 'Medium Cool (1969)')
//         -> FileScan('movies')
//       -> FileScan('ratings')
// ```

// Alternate way of representing this:
// First argument is params, second param is child nodes?

// const testProjection = {
//   operator: 'AVERAGE',
//   params: [],
//   children: [{
//     operator: 'PROJECTION',
//     params: ['rating'],
//     children: [{
//       operator: 'FILESCAN',
//       params: ['Movies', ['movie_id','title','genres']],
//       children: [],
//     }]
//   }]
// }

const testProjection = {
  operator: 'AVERAGE',
  params: [],
  children: [{
    operator: 'SORT',
    params: ['title'],
    children: [{
      operator: 'PROJECTION',
      params: ['movie_id'],
      children: [{
        operator: 'LIMIT',
        params: ['10000'],
        children: [{
          operator: 'FILESCAN',
          params: ['Movies', ['movie_id','title','genres']],
          children: [],
        }],
      }]
    }],
  }],
}

// [
//   ['Average', [], [
//   ],
//     ['Projection', ['rating'], [
//       ['Selection', ['movieId', 'EQUALS', '5000'], []]
//     ]
//   ],
// ]

// [
// ['Average',[],[
//   ['Projection', ['rating'], [
//     ['NestedLoopsJoin', [], [
//       ['Selection', ['movieId','equals','Medium Cool (1969)'], [
//         ['FileScan', 'movies', []],
//       ],
//       ['FileScan', 'ratings', []],
//     ]
//   ]
// ]
// ]


executor.execute(testProjection);
