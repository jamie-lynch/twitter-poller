var poller = require('../../utils/poller')

describe('The sortAscendingOnId function', () => {
  it('sorts an array of objects in ascending order based on id', () => {
    expect.assertions(1)
    let array = [{ id: 5 }, { id: 2 }, { id: 3 }]
    array.sort(poller.sortAscendingOnId)
    expect(array).toEqual([{ id: 2 }, { id: 3 }, { id: 5 }])
  })
})

describe('The processTweets function', () => {
  var spy

  beforeAll(() => {
    spy = jest.spyOn(poller, 'sortAscendingOnId')
    poller.poll = jest.fn()
    poller.startPoll('left', 'right')
  })

  beforeEach(() => {
    spy.mockClear()
  })

  it('does nothing if there are no tweets', () => {
    expect.assertions(1)
    poller.processTweets({ statuses: [] })
    expect(spy.mock.calls.length).toBe(0)
  })

  it('does something if there are tweets', () => {
    expect.assertions(1)
    poller.processTweets({ statuses: [{ id: 3 }, { id: 1 }, { id: 2 }] })
    expect(poller.getPollData(true)).toEqual({
      leftTweets: [{ id: 1 }, { id: 2 }, { id: 3 }],
      leftCount: 3,
      rightCount: 0,
      rightTweets: []
    })
  })

  it('does something if it gets even more tweets', () => {
    expect.assertions(1)
    poller.processTweets({ statuses: [{ id: 4 }, { id: 3 }, { id: 5 }] })
    expect(poller.getPollData(true)).toEqual({
      leftTweets: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
      leftCount: 5,
      rightCount: 0,
      rightTweets: []
    })
  })

  afterAll(() => {
    spy.mockReset()
  })
})
