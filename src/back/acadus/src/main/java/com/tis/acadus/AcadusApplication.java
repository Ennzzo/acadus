package com.tis.acadus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

import com.tis.acadus.seed.MvpDataSeeder;

@SpringBootApplication
public class AcadusApplication {

	public static void main(String[] args) {
		ConfigurableApplicationContext context = SpringApplication.run(AcadusApplication.class, args);
		MvpDataSeeder mvpDataSeeder = context.getBean(MvpDataSeeder.class);
		mvpDataSeeder.seedIfEmpty(); // Comentar esta linha para nao gerar os dados demo do MVP.
		// mvpDataSeeder.deleteDemoData(); // Para apagar os dados demo, comentar a linha acima e descomentar esta.
	}

}
