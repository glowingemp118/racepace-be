const Support = require('../../schemas/ContactSupport');

const getSupport = async (pageno , status , search ,limit) => {
    const skip = (pageno - 1) * limit

    const filter = {};

    if (search) {
        filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
   ]}

    if (status) {
        filter.status = status;
    }
    const support = await Support.aggregate([
        {
          $match:filter
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $facet: {
                metadata: [
                    {
                        $count: "total",
                    },
                ],
                data: [
                    {
                        $skip: skip,
                    },
                    {
                        $limit: limit,
                    },
                ],
            },
        },
    ]);

    if (support[0].data.length<1) { 
        return {
            total_length: 0,
            total_pages: 0,
            data: [],
        };
     } else {
        const total_pages = Math.ceil(
            support[0].metadata[0].total / limit
        );
        const total_length = support[0].metadata[0].total
        return {
            total_length,
            total_pages: total_pages,
            data: support[0].data,
        };
    }
}



module.exports = { getSupport}