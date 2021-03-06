//variable global
var questionarios = {};

$(document).ready(function(){

    //validate
    $('form#formQuestionario').validate({
        rules: {
            titulo: {
                required: true,
                minlength: 5
            },
            prazodata: {
                required: true
            },
            prazohora: {
                required: true
            }
        },
        messages: {
            titulo: { 
                required: 'Preencha o título do seu questionário',
                minlength: 'Vamos lá o título deve ter cinco caracteres'
            },
            prazodata: { 
                required: 'Preencha a data do prazo'
            },
            prazohora: { 
                required: 'Preencha o horário do prazo'
            }
        },
        highlight: function (element, errorClass, validClass) {
            if (element.type === "radio") {
                this.findByName(element.name).addClass(errorClass).removeClass(validClass);
                $(element).closest('.form-group').removeClass('has-success has-feedback').addClass('has-error has-feedback');
            } else {
                $(element).closest('.form-group').removeClass('has-success has-feedback').addClass('has-error has-feedback');
                // $(element).closest('.form-group').find('i.fa').remove();
                $(element).closest('.form-group').append('<i class="fa fa-times fa-validate form-control-feedback fa-absolute"></i>');
            }
        },
        unhighlight: function (element, errorClass, validClass) {
            if (element.type === "radio") {
                this.findByName(element.name).removeClass(errorClass).addClass(validClass);
            } else {
                $(element).closest('.form-group').removeClass('has-error has-feedback').addClass('has-success has-feedback');
                // $(element).closest('.form-group').find('i.fa').remove();
                $(element).closest('.form-group').append('<i class="fa fa-check fa-validate form-control-feedback fa-absolute"></i>');
            }
        },
        errorElement: 'span',
        errorClass: 'help-block',
        errorPlacement: function(error, element) {
            if(element.parent('.input-group').length) {
                error.insertAfter(element.parent());
            } else if (element.attr("type") == "radio") {
                error.insertAfter(element.parent().parent());
            }else{
                error.insertAfter(element);
            }
        }
    });

    function get(){
        var params = {
            id: $('#id').val()
        };
        params = JSON.stringify(params);

        //list
        app.util.getjson({
            url : "/controller/office/questionario/get",
            method : 'POST',
            contentType : "application/json",
            data: params,
            success: function(response){
                if(response.id){
                    //set
                    questionarios = response;

                    //datepicker
                    var pd = new Date(response.data);
                    $("#prazodata").datepicker({
                        autoclose: true, 
                        todayHighlight: true,
                        format: "dd/mm/yyyy",
                        language: 'pt-BR'
                    }).datepicker('setDate', pd);
                    //clockpicker
                    $('#prazohora').val(response.hora);
                    $('#prazohora').clockpicker({
                        placement: 'bottom', 
                        align: 'left',
                        autoclose: true, 
                        'default': 'now'
                    });

                    $('#editName').html(response.titulo);
                    $('#titulo').val(response.titulo);
                    $('#introducao').val(response.introducao);

                    //itens
                    for (var i=0;i<response.pergunta.length;i++) {
                        
                        var perguntas = response.pergunta[i];
                        var item = $('div#pergunta:first').clone();
                        item.attr('data-id',i);
                        item.find('.form-group').removeClass('has-success has-feedback');
                        item.find('.form-group i').remove();
                        item.find('#perguntaId').val(response.pergunta[i].id);
                        item.find('input#pergunta').val(response.pergunta[i].titulo);
                        item.find('input#pergunta').attr('name', 'pergunta'+i);
                        item.find('select#tipo').val(response.pergunta[i].tipo);
                        if(response.pergunta[i].obrigatoria == 1)
                            item.find('input#obrigatoria').prop('checked', true);

                        if(perguntas.resposta != undefined){
                            var respostas = perguntas.resposta;

                            //add options
                            var html = '';
                            var resposta = item.find('#respostas #campo').html('');

                            for(var x=0;x<respostas.length;x++){
                                if(parseInt(perguntas.tipo) == 2){
                                    html += '<div class="input-group m-b-15">'+
                                                '<div class="input-group-addon">'+
                                                    '<i class="fa fa-dot-circle-o"></i>'+
                                                '</div>'+
                                                '<input type="hidden" id="idresposta'+i+'" name="idresposta'+i+'[]" value="'+respostas[x].id+'">'+
                                                '<input type="text" class="form-control" id="resposta'+i+'" name="resposta'+i+'[]" placeholder="Opção '+(x+1)+'" value="'+respostas[x].titulo+'">'+
                                                '<a href="javascript:void(0);" id="btn-op" class="btn-op">'+
                                                    '<i class="fa fa-times-circle-o"></i>'+
                                                '</a>'+
                                            '</div>';

                                }else if(parseInt(perguntas.tipo) == 3){
                                    html += '<div class="input-group m-b-15">'+
                                                '<div class="input-group-addon">'+
                                                    '<i class="fa fa-check-square-o"></i>'+
                                                '</div>'+
                                                '<input type="hidden" id="idresposta'+i+'" name="idresposta'+i+'[]" value="'+respostas[x].id+'">'+
                                                '<input type="text" class="form-control" id="resposta'+i+'" name="resposta'+i+'[]" placeholder="Opção '+(x+1)+'" value="'+respostas[x].titulo+'">'+
                                                '<a href="javascript:void(0);" id="btn-op" class="btn-op">'+
                                                    '<i class="fa fa-times-circle-o"></i>'+
                                                '</a>'+
                                            '</div>';
                                }
                            }
                            resposta.append(html);
                            if(parseInt(perguntas.tipo) == 2){
                                html = '<div class="m-b-15">'+
                                            '<a id="adicionar-radio" href="javascript:void(0);">Adicionar opção</a>'+
                                        '</div>';
                            }else if(parseInt(perguntas.tipo) == 3){
                                html = '<div class="m-b-15">'+
                                            '<a id="adicionar-check" href="javascript:void(0);">Adicionar opção</a>'+
                                        '</div>';
                            }
                            resposta.parents('div#respostas').append(html);
                        }
                        if(i >= 1){
                            item.find('button#pergunta-excluir').removeClass('hidden');
                            item.find('button#pergunta-duplicar').removeClass('hidden');
                        }
                        $('#perguntas').append(item)
                    }
                    //remove first item
                    $('div#pergunta:first').remove();

                    //hidden
                    $('#form-loading').addClass('hidden');
                    $('#form').removeClass('hidden');
                }else{
                    window.location.href = "/404";
                }

            },
            error : function(response){
                window.location.href = "/404";
            }
        });
    }

    //add
    $('button#add').livequery('click',function(event){
        var pergunta = $('div#pergunta:first').clone();
        $('#perguntas').append(pergunta)

        var count = $('div#pergunta').length;
        var item = $('div#pergunta:last');
        item.attr('data-id',count);
        item.find('.form-group').removeClass('has-success has-feedback');
        item.find('.form-group i').remove();
        item.find('#perguntaId').remove();
        item.find('input#pergunta').attr('name', 'pergunta'+count);
        item.find('input#pergunta').val('');
        item.find('#obrigatoria').attr('name', 'obrigatoria'+count);
        item.find('#obrigatoria').prop('checked', false);
        item.find('button#pergunta-excluir').removeClass('hidden');
        item.find('button#pergunta-duplicar').removeClass('hidden');
        item.find('#respostas').html('');
        var html = '<div id="campo" class="form-group">'+
                        '<input type="text" class="form-control" id="resposta'+count+'" name="resposta'+count+'[]" placeholder="Texto da resposta curta" disabled="true">'+
                    '</div>';
        item.find('#respostas').html(html);
        return false;
    });

    //tipo de pergunta change
    $('select#tipo').livequery('change',function(event){
        var id = $(this).parents('#pergunta').data('id');
        var tipo = parseInt($(this).val());
        var resposta = $(this).parents('#pergunta');
        var html = '';
        resposta.find('#respostas').html('');
        switch(tipo){
            case 1:
                html = '<div id="campo" class="form-group">'+
                            '<input type="text" class="form-control" id="resposta'+id+'" name="resposta'+id+'[]" placeholder="Texto da resposta curta" disabled="true">'+
                        '</div>';
            break;
            case 2:
                html = '<div id="campo" class="m-b-15">'+
                            '<div class="input-group m-b-15">'+
                                '<div class="input-group-addon">'+
                                    '<i class="fa fa-dot-circle-o"></i>'+
                                '</div>'+
                                '<input type="text" class="form-control" id="resposta'+id+'" name="resposta'+id+'[]" placeholder="Opção 1">'+
                            '</div>'+
                        '</div>'+
                        '<div class="m-b-15">'+
                            '<a id="adicionar-radio" href="javascript:void(0);">Adicionar opção</a>'+
                        '</div>';
            break;
            case 3:
                html = '<div id="campo" class="m-b-15">'+
                            '<div class="input-group m-b-15">'+
                                '<div class="input-group-addon">'+
                                    '<i class="fa fa-check-square-o"></i>'+
                                '</div>'+
                                '<input type="text" class="form-control" id="resposta'+id+'" name="resposta'+id+'[]" placeholder="Opção 1">'+
                            '</div>'+
                        '</div>'+
                        '<div class="m-b-15">'+
                            '<a id="adicionar-check" href="javascript:void(0);">Adicionar opção</a>'+
                        '</div>';
            break;
        }
        resposta.find('#respostas').html(html);
    });

    //duplicate
    $('button#pergunta-duplicar').livequery('click',function(event){
        var tipo = $(this).parents('div#pergunta').find('select#tipo').val();
        var pergunta = $(this).parents('div#pergunta').clone();
        pergunta.find('select#tipo').val(tipo);
        $('#perguntas').append(pergunta);

        var count = $('div#pergunta').length;
        var item = $('div#pergunta:last');
        item.attr('data-id',count);
        item.find('.form-group').removeClass('has-success has-feedback');
        item.find('#pergunta').attr('name', 'pergunta'+count);
        item.find('#perguntaId').remove();
    });

    //add radio
    $('a#adicionar-radio').livequery('click',function(event){
        var id = $(this).parents('#pergunta').data('id');
        var resposta = $(this).parents('#pergunta');
        var count = resposta.find('#respostas input[type="text"]').length;
        var item = '<div class="input-group m-b-15">'+
                        '<div class="input-group-addon">'+
                            '<i class="fa fa-dot-circle-o"></i>'+
                        '</div>'+
                        '<input type="text" class="form-control" id="resposta'+id+'" name="resposta'+id+'[]" placeholder="Opção '+(count+1)+'">'+
                        '<a href="javascript:void(0);" id="btn-op" class="btn-op">'+
                            '<i class="fa fa-times-circle-o"></i>'+
                        '</a>'+
                    '</div>';
        resposta.find('#respostas #campo').append(item);
        return false;
    });

    //add check
    $('a#adicionar-check').livequery('click',function(event){
        var id = $(this).parents('#pergunta').data('id');
        var resposta = $(this).parents('#pergunta');
        var count = resposta.find('#respostas input[type="text"]').length;
        var item = '<div class="input-group m-b-15">'+
                        '<div class="input-group-addon">'+
                            '<i class="fa fa-check-square-o"></i>'+
                        '</div>'+
                        '<input type="text" class="form-control" id="resposta'+id+'" name="resposta'+id+'[]" placeholder="Opção '+(count+1)+'">'+
                        '<a href="javascript:void(0);" id="btn-op" class="btn-op">'+
                            '<i class="fa fa-times-circle-o"></i>'+
                        '</a>'+
                    '</div>';
        resposta.find('#respostas #campo').append(item);
        return false;
    });

    //remove radio
    $('a#btn-op').livequery('click',function(event){
        $(this).parent('.input-group').remove();
        return false;
    });

    //remove pergunta
    $('button#pergunta-excluir').livequery('click',function(event){
        var item = $(this).parents('#pergunta');
        var id = item.find('#perguntaId').val();
        item.find('button#pergunta-duplicar').prop('disabled', true);
        item.find('button#pergunta-excluir').addClass('hidden');
        item.find('div#loading-excluir').removeClass('hidden');

        //params
        var params = {
            id: id
        };
        params = JSON.stringify(params);
        app.util.getjson({
            url : "/controller/office/questionario/deletequestion",
            method : 'POST',
            contentType : "application/json",
            data: params,
            success: function(response){
                if(response.success){
                    item.remove();
                }
            },
            error : function(response){
                response = JSON.parse(response.responseText);
                $('#error').removeClass('hidden');
                $('#error').find('.alert p').html(response.error);
            }
        });
    });

    //save
    $('button#salvar').livequery('click',function(event){
        if($("form#formQuestionario").valid()){

            $('button#salvar').html('Processando...');
            $('button#salvar').prop("disabled",true);
            $('button#cancelar').prop("disabled",true);

            app.util.getjson({
                url : "/controller/office/questionario/edit",
                method : 'POST',
                data: $("form#formQuestionario").serialize(),
                success: function(response){
                    if(response.success){
                        setSession('success', response.success);
                        window.location.href = "/office/questionario";
                    }
                },
                error : function(response){
                    response = JSON.parse(response.responseText);
                    $('#error').removeClass('hidden');
                    $('#error').find('.alert p').html(response.error);
                    $('button#salvar').html('Salvar');
                    $('button#salvar').prop("disabled",false);
                    $('button#cancelar').prop("disabled",false);
                }
            });
        }else{
            $("form#formQuestionario").valid();
        }
        return false;
    });

    //cancel
    $('button#cancelar').livequery('click',function(event){
        window.location.href = "/office/questionario/";
        return false;
    });

	function onError(response) {
      console.log(response);
    }

    //init
    get();

});