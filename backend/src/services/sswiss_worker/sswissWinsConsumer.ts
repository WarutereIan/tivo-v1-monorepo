import { RabbitMQ } from "../../config/rabbitmq/rabbitmq"
import { SSAction } from "../../models/SSActions";
import { Wallet } from "../../models/Wallet";

export const processSoftSwissWinActions = () => {
    const Consumer = RabbitMQ.createConsumer({
        queue: "sswissWinActions",
        queueOptions: { durable: true },
        qos: { prefetchCount: 2 },
        exchanges: [{ exchange: "sswissWinActions", type: "topic" }],
        queueBindings: [{
            exchange: "sswissWinActions",
            routingKey:"sswissWinActions"
        }]
    }, async (msg: any)=>{
        try {
            //body: msg.body

             const { user_id, action } = msg.body

            let userWallet: null | any = await Wallet.findOne({
                ownerID: user_id,
            })

                const _action = action
                 let action_type = _action.action

                let _win_action = await SSAction.create({
                  user_id,
                  action_type,
                  ..._action,
                });

                userWallet.currentBalance += _win_action.amount/(100);
                _win_action.processed = true;
                let date = new Date();
                _win_action.processed_at = { time: date.toISOString() };
                await userWallet.save();

                 await _win_action.save();
                  console.info(`processed win action ${_action.action_id} in queue
                    
                  `);
           
        }
        catch (err) {
            console.error(err)
        }
    })
    
    Consumer.on("ready", () => {
    console.info("sswissWinActions consumer ready");
  });
};
